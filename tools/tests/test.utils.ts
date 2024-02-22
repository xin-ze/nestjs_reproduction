import { execSync } from 'child_process';
import path from 'path';

import map from 'lodash/map';
import { nanoid } from 'nanoid';
import { createConnection } from 'typeorm';

/**
 * Setup a jerry_test DB copy with support run in parallel
 * @returns temp jerry_test DB name
 */
export const prepareTestDB = async () => {
  const connection = await createConnection({
    type: 'postgres',
    url: 'postgres://jerry_test:jerry_test@localhost/jerry_test',
    name: 'test',
  });

  const postgresqlImage = 'public.ecr.aws/docker/library/postgres:14.6-alpine';
  const tempDBName = `jerry_test_${nanoid().replace(/-/g, '')}`.toLowerCase();
  await connection.query(`CREATE DATABASE ${tempDBName}`);
  execSync(
    `docker run --rm -v ${path.join(__dirname, '../..')}:/jerry-serverless ${
      process.platform === 'darwin' ? '' : '--network=host'
    } ${postgresqlImage} psql postgresql://jerry_test:jerry_test@${
      process.platform === 'darwin' ? 'host.docker.internal' : 'localhost'
    }/${tempDBName} -f /jerry-serverless/tools/generators/dump.sql`
  );
  await connection.close();
  // eslint-disable-next-line no-console
  console.log(`Created temp test database ${tempDBName}`);
  return tempDBName;
};

/**
 * Drop temp test DB after each test suit
 */
export const cleanupAllTestDB = async () => {
  const connection = await createConnection({
    type: 'postgres',
    url: 'postgres://jerry_test:jerry_test@localhost/jerry_test',
    name: 'test',
  });
  const dbNamesRaw = await connection.query(`
  SELECT datname
  FROM pg_database
  WHERE datname LIKE 'jerry_test_%' AND datistemplate=false`);
  const dbNames: string[] = map(dbNamesRaw, 'datname');
  for (const dbName of dbNames) {
    try {
      await connection.query(`SELECT pg_terminate_backend (pid) FROM pg_stat_activity WHERE datname = '${dbName}'`);
      await connection.query(`drop database ${dbName}`);
      // eslint-disable-next-line no-console
      console.log(`Temp test database ${dbName} deleted`);
    } catch (e) {
      console.error(`Temp test database ${dbName} delete failed: ${e}`);
    }
  }
  await connection.close();
};
