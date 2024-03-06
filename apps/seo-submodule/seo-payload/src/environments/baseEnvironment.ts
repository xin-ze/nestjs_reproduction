export const baseEnvironment = {
  production: false,
  deployEnv: 'development',
  port: 9101,
  previewHost: 'http://localhost:4201',
  // This config is not working for NODE_ENV=test according to this code:
  // https://github.com/payloadcms/payload/blob/69b97bbc590c62fffbcd03a42f0e9737e3f7ca01/src/mongoose/connect.ts
  mongodb: {
    url: process.env.MONGODB_URL || 'mongodb://localhost:27017',
    databaseName: 'seo-payload',
  },
  payload: {
    serverUrl: 'http://localhost:9101',
  },
  scheduledPublish: {
    cronExpression: '1,31 0-23 * * *',
  },
};

export type Environment = typeof baseEnvironment;
