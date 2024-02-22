import { APP_INTERCEPTOR } from '@nestjs/core';
import type { MiddlewareConsumer } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { createTransport } from 'nodemailer';
import nodemailerSendgrid from 'nodemailer-sendgrid';
import { MailerModule } from '@nestjs-modules/mailer';
import type { ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloDriver } from '@nestjs/apollo';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { AwsSdkModule } from 'nest-aws-sdk';
import { RavenInterceptor, RavenModule } from 'nest-raven';
import { CloudFront, S3 } from 'aws-sdk';
import type { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { TerminusModule } from '@nestjs/terminus';
import depthLimit from 'graphql-depth-limit';


import { MarkdownModule } from './markdown/markdown.module';

/**
 * Content service root module
 */
@Module({
  controllers: [],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        () => ({
          AUTH_SERVICE_RABBITMQ_BROKER: process.env.RABBITMQ_BROKER,
        }),
      ],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (
        configService: ConfigService
      ): {
        retryAttempts?: number;
        retryDelay?: number;
        toRetry?: (err: Error) => boolean;
        autoLoadEntities?: boolean;
        keepConnectionAlive?: boolean;
        verboseRetryLog?: boolean;
      } & PostgresConnectionOptions => ({
        type: 'postgres',
        ...(configService.get('CONTENT_PG_HOST_READER')
          ? {
              replication: {
                master: {
                  host: configService.get('CONTENT_PG_HOST'),
                  port: configService.get('CONTENT_PG_PORT'),
                  username: configService.get('CONTENT_PG_USERNAME'),
                  password: configService.get('CONTENT_PG_PASSWORD'),
                  database: configService.get('CONTENT_PG_DATABASE'),
                },
                slaves: [
                  {
                    host: configService.get('CONTENT_PG_HOST_READER'),
                    port: configService.get('CONTENT_PG_PORT'),
                    username: configService.get('CONTENT_PG_USERNAME'),
                    password: configService.get('CONTENT_PG_PASSWORD'),
                    database: configService.get('CONTENT_PG_DATABASE'),
                  },
                ],
              },
            }
          : {
              host: configService.get('CONTENT_PG_HOST'),
              port: configService.get('CONTENT_PG_PORT'),
              username: configService.get('CONTENT_PG_USERNAME'),
              password: configService.get('CONTENT_PG_PASSWORD'),
              database: configService.get('CONTENT_PG_DATABASE'),
            }),

        logging: configService.get('SHOW_SQL') === 'true' ? ['query', 'error'] : ['error'],

        namingStrategy: new SnakeNamingStrategy(),
        synchronize: false,
        keepConnectionAlive: true,
        autoLoadEntities: true,
        extra: {
          max: 32,
        },
        applicationName: 'content',
      }),
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: (configService: ConfigService) => ({
        // Store generated schema in memory in production to prevent `EROFS: read-only file system` error from Lambda
        autoSchemaFile: configService.get('release_env') === 'dev' ? 'apps/content/schema.gql' : true,
        useGlobalPrefix: true,
        playground: configService.get('release_env') !== 'prod',
        // Pass request and response object to graphql context
        context: ({ req, res }) => ({ req, res }),
        validationRules: [depthLimit(10)],
      }),
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
    RavenModule,
    MarkdownModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useValue: new RavenInterceptor(),
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {

  }
}
