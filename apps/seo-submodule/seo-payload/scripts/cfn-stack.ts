import type { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';

import type { ALBServiceStackProps } from '@jerry-serverless/ecs-stack';
import { BaseALBServicesStack } from '@jerry-serverless/ecs-stack';

import stackProps, { IDENTIFIER } from './config';

export class SeoPayloadStack extends BaseALBServicesStack {
  constructor(scope: Construct, id: string, props: ALBServiceStackProps) {
    super(scope, id, props);
    const service = this.findService(`seo-payload${IDENTIFIER}`);
    if (!service) {
      throw Error('No seo payload service found');
    }

    const scaling = service.autoScaleTaskCount({
      maxCapacity: Number(process.env.MAX_CAPACITY),
      minCapacity: Number(process.env.MIN_CAPACITY),
    });
    scaling.scaleOnMemoryUtilization(`SeoPayload${IDENTIFIER}ScaleOnMemory`, {
      targetUtilizationPercent: 70,
    });
    scaling.scaleOnCpuUtilization(`SeoPayload${IDENTIFIER}ScaleOnCPU`, {
      targetUtilizationPercent: 70,
    });
  }
}

const app = new cdk.App();

/**
 * Create Stack. Any async functions run here
 */
const createStack = async () => {
  const stack = new SeoPayloadStack(app, `SeoPayloadStack${IDENTIFIER}`, stackProps);
  return stack;
};

void createStack();
