import { createTerminus } from '@godaddy/terminus';
import cors from 'cors';
import express from 'express';
import payload from 'payload';
// import payload from '../node_modules/payload';
import * as Sentry from '@sentry/node';
import codeCoverageMiddleware from '@cypress/code-coverage/middleware/express';

// import packageJson from '../../../../package.json';
import packageJson from '../package.json';

import { environment } from './environments/environment';
import { scheduler } from './utils/scheduler';
// import { scheduledPublish } from './bootstrap/scheduledPublish';
// import { seed } from './bootstrap/seed';
// import './tracer';

const app = express();

codeCoverageMiddleware(app);

// TODO: refactor, extract express server bootstrap.
// Redirect all traffic at root to admin UI
app.get('/', function (_, res) {
  res.redirect('/admin');
});

// increase request size limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

app.use(
  '/api',
  cors((req, callback) => {
    const allowedOrigins = [
      new RegExp('http://localhost:4201'),
      new RegExp('http://localhost:4202'),
      new RegExp('https://ui-content-.*-jerry-insur.vercel.app'),
      new RegExp('https://stage.getjerry.com/'),
      new RegExp('https://getjerry.com/'),
    ];
    const origin = req.headers.origin || '';

    callback(null, {
      origin: allowedOrigins.some((pattern) => pattern.test(origin)),
      credentials: true,
    });
  })
);

// Disallow crawlers
app.get('/robots.txt', function (req, res) {
  res.type('text/plain');
  res.send('User-agent: *\nDisallow: /');
});

try {
  Sentry.init({
    dsn: 'https://026ca7637e8f4e2daba154f4fe31dbed@sentry.ing.getjerry.com/385',
    environment: environment.deployEnv,
    tracesSampleRate: 1.0,
  });
} catch (error) {
  console.error(`Sentry init for Seo-submodule failed`, error);
}

const runPayload = async () => {
  let scheduledPublishTask;
console.info('===before init')
  // Initialize Payload
  await payload.init({
    secret: process.env.PAYLOAD_SECRET_KEY || 'SECRET_KEY',
    express: app,
    onInit: async () => {
      console.info('Init payload server.');
      console.info('NODE_ENV: ', process.env.NODE_ENV);

      // init all scheduled jobs.
      // await scheduler.connect();
      // await scheduler.start();

      // scheduledPublishTask = await scheduledPublish(scheduler);

      // await seed();
    },
  });

  const server = app.listen(environment.port, async () => {
    payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`);
  });

  /**
   * Fake health check. Always OK.
   * Waiting for reply from payload team.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async function onHealthCheck() {}

  createTerminus(server, {
    signal: 'SIGINT',
    healthChecks: { '/healthcheck': async () => onHealthCheck },
    headers: {
      'X-Payload-Version': packageJson.dependencies.payload,
    },
  });

  server.on('error', console.error);

  /**
   * Gracefully shutdown
   */
  process.on('SIGTERM', async () => {
    payload.logger.info('SIGTERM signal received.');
    payload.logger.info('closing scheduler.');
    await scheduler.end();
    payload.logger.info('scheduler closed');

    if (scheduledPublishTask) {
      payload.logger.info('stopping scheduled publish.');
      await scheduledPublishTask.stop();
      payload.logger.info('scheduled publish stopped');
    }

    payload.logger.info('closing HTTP server');
    await server.close();
    payload.logger.info('HTTP server closed');
  });
};

void runPayload();
