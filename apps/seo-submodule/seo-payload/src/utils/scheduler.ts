import { Scheduler } from 'node-resque';

export const scheduler = new Scheduler({
  connection: {
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    host: process.env.REDIS_HOST || 'localhost',
    database: parseInt(process.env.REDIS_DB_INDEX_SCHEDULER || '0', 10),
    namespace: process.env.REDIS_NAME_SPACE || 'payload-cms',
    scanCount: 100000,
  },
  namespace: process.env.REDIS_NAME_SPACE || 'payload-cms',
  timeout: 60000,
});
