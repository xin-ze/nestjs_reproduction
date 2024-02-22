import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import { setup } from './setup';

async function bootstrap() {
  const app = await setup(await NestFactory.create(AppModule));
  const port = process.env.PORT || 3333;
  await app.listen(port, () => {
    Logger.log(`Listening at http://localhost:${port}`);
    Logger.log(`GraphQL endpoint: http://localhost:${port}/api/content/graphql`);
  });

  process.on('SIGTERM', async () => {
    Logger.log('Received SIGTERM. Terminating...');
    await app.close();
  });
}

void bootstrap();
