import cookieParser from 'cookie-parser';
import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { CloudfrontService } from 'cloudfront-ip-ranges/dist/cloudfront.service';
import type { Application } from 'express';

export const setup = async (app: NestExpressApplication): Promise<INestApplication> => {
  Sentry.init({ dsn: process.env.sentry_dsn, environment: process.env.release_env });
  app.use(cookieParser());
  app.enableCors();
  app.setGlobalPrefix('api/content');
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  // Set Trust Proxy so we can have client IP (for rate limiter)
  await setTrustIpList((app as unknown) as Application);

  // Starts listening for shutdown hooks
  app.enableShutdownHooks();

  return app;
};

/**
 * Our service is behind CloudFront, So we need to add CF ip to trust proxy ips.
 * @param app
 */
const setTrustIpList = async (app: Application) => {
  const service = new CloudfrontService();
  // Add trust proxy, will also add loop back addresses.
  await service.updateTrustProxy(app);

  // Update ip list every 12 hours.
  setInterval(() => void service.updateTrustProxy(app), 1000 * 60 * 60 * 12);
};
