/* eslint-disable no-console */
import { execSync } from 'child_process';

import moment from 'moment';
import { map, sortBy, find, groupBy, reduce, filter } from 'lodash';
import { Sequelize } from 'sequelize-typescript';

// Maximum users to delete
const limit = Number(process.env.LIMIT || 1000);

/**
 * Result of find referencing table and column
 * https://dba.stackexchange.com/questions/265732/postgresql-how-to-list-all-foreign-key-link-to-primary-key-of-a-table
 */
interface ReferencingResult {
  referencing_table: string;
  referencing_column: string;
}

/**
 * Result of find user related tables and column name
 */
interface UserRelatedTablesPair {
  table_name: string;
  column_name: string;
}

/**
 * This script is for purging users in stage DB that have been deleted since 7 days ago and name is E2E Testing. Limited 2000 users per execute.
 */
const main = async () => {
  // Get DB params from AWS ssm
  const ssmParams = {
    host: `jerry-db.stage.rds-host`,
    username: `jerry-db.stage.rds-user`,
    password: `jerry-db.stage.rds-pass`,
    db: `jerry-db.stage.rds-db`,
  };
  const paramNames = Object.values(ssmParams).join(' ');
  const ssmResp = execSync(
    `aws ssm get-parameters --names ${paramNames} --with-decryption --query "Parameters[*].{Name:Name,Value:Value}"`
  );
  const vals = JSON.parse(ssmResp.toString());
  const dbParams: Record<string, string> = {};
  Object.keys(ssmParams).forEach((key) => {
    const paramName = ssmParams[key];
    const paramVal = find(vals, (val) => val.Name === paramName);
    if (paramVal) {
      dbParams[key] = paramVal.Value;
    } else {
      console.error(`Could not find ssm value for '${paramName}'`);
      process.exit(1);
    }
  });

  /**
   * Init DB connection
   */
  console.time('Purge Users');
  const db = new Sequelize({
    dialect: 'postgres',
    logging: false,
    host: dbParams.host,
    database: dbParams.db,
    username: dbParams.username,
    password: dbParams.password,
    dialectOptions: {
      multipleStatements: true,
      statement_timeout: 1200000, // 5 minutes
    },
  });
  let error;
  const log: string[] = [];
  let next = true;
  try {
    // Batch run delete data
    for (let loop = 0; loop < limit / 100; loop++) {
      if (!next) {
        return;
      }
      // Delete maximum 100 users related data
      await db.transaction(async (transaction) => {
        /**
         * Helper functions
         */
        const deleteData = async (tableName: string, deleteQuery: string) => {
          log.push(deleteQuery);
          console.log(`start delete table ${tableName}`);
          const deleteRaw = await db.query(deleteQuery, {
            transaction,
          });
          console.log(`delete table ${tableName} with ${deleteRaw[0].length} rows`);
        };
        // Delete identifier related tables helper.
        const deleteRelated = (identifier: string) => async (ids: string[], tableNames: string[]) => {
          if (ids.length === 0) {
            console.log('skip delete tables', tableNames);
            return;
          }
          for (const tableName of tableNames) {
            const deleteQuery = `delete from ${tableName} where ${identifier} in (${ids.join(
              ','
            )}) returning ${identifier}`;
            await deleteData(tableName, deleteQuery);
          }
        };

        // Delete user related tables;
        const deleteUserRelated = deleteRelated('user_id');
        // Delete driver related tables
        const deleteDriverRelated = deleteRelated('driver_id');
        // Find all referencing tables
        const findReferencingTables = async (tableName: string): Promise<ReferencingResult[]> => {
          const rawResult = await db.query(`SELECT la.attrelid::regclass AS referencing_table,
          la.attname AS referencing_column
   FROM pg_constraint AS c
      JOIN pg_index AS i
         ON i.indexrelid = c.conindid
      JOIN pg_attribute AS la
         ON la.attrelid = c.conrelid
            AND la.attnum = c.conkey[1]
      JOIN pg_attribute AS ra
         ON ra.attrelid = c.confrelid
            AND ra.attnum = c.confkey[1]
   WHERE c.confrelid = '${tableName}'::regclass
     AND c.contype = 'f'
     AND ra.attname = 'id'
     AND cardinality(c.confkey) = 1`);
          return rawResult[0] as ReferencingResult[];
        };
        // Delete all tables that referencing table
        const deleteRefereningTables = async (tableName: string, ids: string[]) => {
          const referencing = await findReferencingTables(tableName);
          const referencingGroup = groupBy(referencing, 'referencing_column');
          for (const column in referencingGroup) {
            await deleteRelated(column)(ids, map(referencingGroup[column], 'referencing_table'));
          }
        };

        /**
         * Find all user IDs which intend to purge
         */
        const userIDsRaw = await db.query(
          `SELECT id FROM users where name = 'E2E Testing' and created_at < '${moment()
            .subtract(7, 'days')
            .format('YYYY-MM-DD')}' and is_deleted=true limit 100`,
          { transaction }
        );
        const userIDs = map(userIDsRaw[0], 'id');
        console.log(`Found ${userIDs.length} test users`);
        // Stop loop as there is not enough user to delete
        if (userIDs.length < 100) {
          next = false;
        }
        if (userIDs.length === 0) {
          return;
        }

        /**
         * Break down users -> policy_bundles dependency
         * TODO: Fix users.switching_to_bundle_id on delete policy
         */
        await db.query(`update users set switching_to_bundle_id=null where id in (${userIDs.join(',')})`, {
          transaction,
        });

        /**
         * Find all driver IDs which intend to purge
         */
        const driverIDsRaw = await db.query(`SELECT id FROM drivers where user_id in (${userIDs.join(',')})`, {
          transaction,
        });
        const driverIDs = map(driverIDsRaw[0], 'id');
        console.log(`Found ${driverIDs.length} test drivers`);

        /**
         * Purge all driver related tables
         */
        // Get all table names which contains 'driver_id' field
        const driverTableNamesRaw = await db.query(
          `SELECT distinct table_name FROM information_schema.columns where column_name='driver_id'`,
          { transaction }
        );
        const driverTableNames = map(driverTableNamesRaw[0], 'table_name').filter((name) => !['users'].includes(name));
        console.log(`Found ${driverTableNames.length} driver related tables`);
        // Purge driver related tables
        await deleteDriverRelated(driverIDs, driverTableNames);
        /**
         * Purge automation related tables
         * final_price_fetches -> carrier_quotings -> policies -> user_id
         */
        const policyIDsRaw = await db.query(`select id from policies where user_id in (${userIDs.join(',')})`, {
          transaction,
        });
        const policyIDs = map(policyIDsRaw[0], 'id');
        if (policyIDs.length) {
          const carrierQuotingsIDsRaw = await db.query(
            `select id from carrier_quotings where policy_id in (${policyIDs.join(',')})`,
            {
              transaction,
            }
          );
          // Clear final_price_fetches dependencies
          // user_switches -> carrier_binds(cascade delete) -> final_price_fetches
          await deleteUserRelated(userIDs, ['user_switches']);
          // Purge final_price_fetches table
          const carrierQuotingsIDs = map(carrierQuotingsIDsRaw[0], 'id');
          await deleteRelated('carrier_quoting_id')(carrierQuotingsIDs, ['final_price_fetches']);

          /**
           * Break down policies -> policy_sales dependency
           * TODO: Fix policies.initial_sale_id on delete policy
           */
          await db.query(`update policies set initial_sale_id=null where user_id in (${userIDs.join(',')})`, {
            transaction,
          });

          // Purge carrier_quotings, policy_history_logs and policies related table
          await deleteRefereningTables('policies', policyIDs);
        }

        /**
         * Purge other user related tables
         */
        await deleteRelated('created_by')(userIDs, ['policy_adhoc_payments']);

        /**
         * Purge all user related tables
         */
        // Get all table names which contains 'user_id' field
        const userTableNamesRaw = await db.query(
          `SELECT distinct table_name, column_name FROM information_schema.columns where column_name ilike '%user_id'`,
          { transaction }
        );
        const tableNamePairs = filter(
          userTableNamesRaw[0] as UserRelatedTablesPair[],
          ({ table_name }) => !driverTableNames.includes(table_name)
        );
        console.log(`Found ${tableNamePairs.length} user related tables`);

        // Make sure delete table in the right order
        const sorted = sortBy(tableNamePairs, ({ table_name }) => {
          const index = [
            'employments',
            'loan_applications',
            'policy_drivers',
            'policy_histories',
            'user_switches',
            'policies',
            'user_document_uploads',
            'user_stripe_payment_methods',
            'inbox_messages',
          ].indexOf(table_name);
          return index >= 0 ? index : 1000000000;
        });
        for (const { table_name, column_name } of sorted) {
          await deleteRelated(column_name)(userIDs, [table_name]);
        }

        /**
         * Purge users table
         */
        await deleteRelated('id')(userIDs, ['users']);

        /***
         * Done.
         */
        // console.log('========== Raw Query ==========');
        // console.log(log.join(';\n'));
      });
    }
  } catch (e) {
    error = e;
    console.error(error.stack);
    console.error(log.slice(log.length - 1));
  } finally {
    await db.close();
    console.timeEnd('Purge Users');
    if (error) {
      process.exit(-1);
    }
  }
};
void main();

/**
 * Final delete table order:
 * - accidents
 * - comp_losses
 * - credit_reports
 * - employments
 * - loan_stipulations
 * - policy_drivers
 * - user_document_log_drivers
 * - violations
 * - user_switches
 * - final_price_fetches
 * - carrier_quotings
 * - policy_history_logs
 * - policy_adhoc_payments
 * - loan_applications
 * - policy_histories
 * - user_switches
 * - policies
 * - user_document_uploads
 * - user_stripe_payment_methods
 * - agent_switches
 * - bs_searches
 * - carrier_logins
 * - clue_orders
 * - devices
 * - drivers
 * - emergency_contacts
 * - event_firing_track
 * - ezlynx_switches
 * - fb_page_users
 * - gift_cards
 * - importer_switches
 * - inbox_messages
 * - lienholders
 * - loan_addon_cancellations
 * - loan_application_assignments
 * - loan_offers
 * - memberships
 * - multiple_final_price_fetches
 * - mvr_orders
 * - partner_quotes_requests
 * - payment_methods
 * - pending_renewals
 * - phone_login_codes
 * - policy_batches
 * - policy_bundles
 * - policy_cancellations
 * - policy_renewal_switches
 * - policy_sale_cancellations
 * - policy_sales
 * - prediction_record
 * - questions
 * - quoting_declinations
 * - quotings
 * - sales_plans
 * - user_bank_accounts
 * - user_car_loans
 * - user_carrier_logins
 * - user_cars
 * - user_content_categories
 * - user_credit_cards
 * - user_document_logs
 * - user_events
 * - user_homes
 * - user_logins
 * - user_mortgages
 * - user_notes
 * - user_payment_methods
 * - user_plaid_items
 * - user_shipments
 * - user_stats
 * - user_tag_users
 * - vendor_responses
 * - users
 */
