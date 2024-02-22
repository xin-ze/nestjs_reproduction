// eslint-disable-next-line @typescript-eslint/no-var-requires
const SnakeNamingStrategy = require('typeorm-naming-strategies').SnakeNamingStrategy;

module.exports = {
  type: 'postgres',
  host: process.env.CONTENT_PG_HOST,
  port: process.env.CONTENT_PG_PORT || '5432',
  username: process.env.CONTENT_PG_USERNAME || 'web_server',
  password: process.env.CONTENT_PG_PASSWORD || 'jerry',
  database: process.env.CONTENT_PG_DATABASE || 'content_dev',
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: false,
  entities: ['apps/content/src/**/*.entity.ts'],
  migrations: ['apps/content/src/migrations/*.ts'],
  cli: {
    migrationsDir: 'apps/content/src/migrations',
  },
};
