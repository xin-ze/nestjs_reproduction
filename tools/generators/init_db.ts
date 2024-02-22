import fs from 'fs';

import { Sequelize } from 'sequelize-typescript';

/**
 * This script is for restore the dump.sql to Github Actions build job DB
 * to facilitate the unit test which needs DB schema
 *
 * WARN: The dump.sql is not always in sync of jerry2 latest DB schema,
 * if you need the latest schema, you need to update the dump.sql manually by running
 * `pg_dump -s jerry_test > dump.sql`
 */
const main = async () => {
  console.time('DB Schema Init');
  const db = new Sequelize({
    dialect: 'postgres',
    logging: false,
    host: process.env.rds_host,
    database: process.env.rds_db,
    username: process.env.rds_user,
    password: process.env.rds_pass,
    dialectOptions: {
      multipleStatements: true,
    },
  });
  let error;
  try {
    await db.query('CREATE DATABASE content_db;', { raw: true });
    await db.query('CREATE DATABASE telematics_test;', { raw: true });
    await db.query('CREATE DATABASE remote_config_db_test;', { raw: true });
    await db.query('CREATE DATABASE post_bind_db_test;', { raw: true });
    await db.query(fs.readFileSync(`${__dirname}/dump.sql`).toString(), { raw: true });
    await db.query(fs.readFileSync(`${__dirname}/redshift_dump.sql`).toString(), { raw: true });
  } catch (e) {
    error = e;
    console.error(error.stack);
  } finally {
    await db.close();
    console.timeEnd('DB Schema Init');
    if (error) {
      process.exit(-1);
    }
  }
};
main();
