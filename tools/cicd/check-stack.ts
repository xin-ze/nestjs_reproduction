/**
 * This script is used for check AWS CloudFormation Stack status, if the status contains failed/rollback
 * means this stack is unhealthy, need to handle it manually before going further.
 *
 * Example:
 * We want to make sure the stage stack is healthy before we deploy to prod: `npm run ts ./tools/cicd/check-stack.ts jerry-headless-stage && echo 'Deploy to prod'`
 */
import { execSync } from 'child_process';

import endsWith from 'lodash/endsWith';
import get from 'lodash/get';

const stackName = process.argv.slice(2);
const result = execSync(`aws cloudformation describe-stacks --stack-name ${stackName}`).toString();
try {
  const stackInfo = JSON.parse(result);
  const stackStatus: string = get(stackInfo, 'Stacks[0].StackStatus', '');
  console.log('Stack status:', stackStatus);
  /**
   * stack status list
   * https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-describing-stacks.html
   * A failed stack status is ends with "failed"
   */
  if (endsWith(stackStatus.toLocaleLowerCase(), 'failed')) {
    throw Error(`Please fix the stack ${stackName}, it's in failed status ${stackStatus}`);
  }
  console.log('Stack Check Pass');
} catch (e) {
  console.error(e);
  console.log('Stack Check Failed');
  process.exit(1);
}
