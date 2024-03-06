import assert from 'assert';
import fs from 'fs';

import { Duration } from 'aws-cdk-lib';
import dotenv from 'dotenv';

import type { ALBServiceStackProps } from '@jerry-serverless/ecs-stack';
import { splitEnvs } from '@jerry-serverless/ecs-stack';

dotenv.config({ path: `${__dirname}/../.env.${process.env.ENV}` });

// All possible stages
const STAGES = ['stage', 'prod'];

assert(STAGES.includes(process.env.ENV || ''), `ENV must be one of these: [ 'stage', 'prod' ]`);
// Provide from external
assert(process.env.TAG, `Must provide deploy version as TAG (eg. 0.1.3400)`);
assert(process.env.IDENTIFIER, `Must provide unique IDENTIFIER (eg. PR#)`);
// Read from env files
assert(process.env.SERVICE_NAME, `Must provide SERVICE_NAME`);
assert(process.env.CERTIFICATE_ARN, `Must provide CERTIFICATE_ARN`);
assert(process.env.MIN_CAPACITY, 'Must provide MIN_CAPACITY for service auto scaling');
assert(process.env.MAX_CAPACITY, 'Must provide MAX_CAPACITY for service auto scaling');
assert(process.env.AWS_LOG_GROUP, 'Must provide AWS_LOG_GROUP for cloudwatch logging');

export const IDENTIFIER = process.env.IDENTIFIER;

const TAG = process.env.TAG;
const SERVICE_NAME = `${process.env.SERVICE_NAME}${IDENTIFIER}`;
const ENV = process.env.ENV ?? 'stage';
const domainName = process.env.DOMAIN_NAME || `${SERVICE_NAME}-engineering.stage.getjerry.com`;
const TTL = process.env.TTL || '1440'; // Default to 1 day in minutes

/**
 * If stack is used for temporary purpose
 */
const isTempStack = ENV !== IDENTIFIER;

/**
 * Container used environment values
 */
const customEnv = splitEnvs(dotenv.parse(fs.readFileSync(`${__dirname}/envs/seo-payload.env.${process.env.ENV}`)));

const stackProps: ALBServiceStackProps = {
  tags: {
    Env: ENV,
    Owner: 'Depeng',
    Lob: 'Jerry',
    Function: 'SEO-Payload-CMS',
    Department: 'SEO_and_Content',
    DataSensitivity: 'Medium',
  },
  deployEnv: ENV,
  name: SERVICE_NAME,
  clusterName: isTempStack ? 'default' : undefined, // Use existing default ECS cluster when stack is for temporary purpose
  ttl: isTempStack ? TTL : undefined,
  loadBalancerIdleTimeout: Duration.minutes(10),
  services: [
    {
      repositoryName: 'serverless/seo-payload',
      imageTag: TAG,
      containerPort: 3333,
      logging: 'cloudwatch',
      logGroupName: process.env.AWS_LOG_GROUP,
      datadog: true,
      healthCheck: {
        path: '/healthcheck',
        unhealthyThresholdCount: 5,
      },
      deregistrationDelay: Duration.seconds(30),
      environment: {
        ...customEnv.plain,
        VERSION: TAG,
        // Set old space to be lower than memory limit
        NODE_OPTIONS: '--max-old-space-size=7168',
        AWS_LOG_GROUP: process.env.AWS_LOG_GROUP,
        // DataDog Config
        DD_RUNTIME_METRICS_ENABLED: 'true',
        DD_PROFILING_PROFILERS: 'wall,space,cpu-experimental',
      },
      secrets: {
        ...customEnv.secret,
      },
      spot: true,
      pathPatterns: ['/*'],
      props: {
        healthCheckGracePeriod: Duration.seconds(15),
        serviceName: `seo-payload${IDENTIFIER}`,
        desiredCount: Number(process.env.MIN_CAPACITY),
      },
      taskProps: {
        memoryLimitMiB: 8192,
        cpu: 2048,
      },
      containerProps: {
        dockerLabels: {
          'com.datadoghq.tags.env': ENV,
          'com.datadoghq.tags.service': 'seo-payload',
          'com.datadoghq.tags.version': TAG,
        },
      },
      priority: 100,
      securityGroupsId: ['sg-c02edebb', 'sg-4a085a36'],
      taskRoleExtraPolicies: [
        {
          Effect: 'Allow',
          Action: ['s3:*'],
          Resource: `arn:aws:s3:::${customEnv.plain.JERRY_UPLOAD_BUCKET}/*`,
        },
      ],
    },
  ],
  certificateArn: process.env.CERTIFICATE_ARN || '',
  domainName,
};

export default stackProps;
