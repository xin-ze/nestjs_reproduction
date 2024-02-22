import { execSync } from 'child_process';

import each from 'lodash/each';
import compact from 'lodash/compact';
import filter from 'lodash/filter';

import { execPromise } from './utils';

const cmd = 'nx affected:apps --base=$(git rev-parse HEAD~1) --head=HEAD --plain';

let apps: string[] = [];
if (process.env.APPS) {
  // Use APPS env
  apps = process.env.APPS.split(',');
} else {
  // Get all the affected apps.
  apps = compact(execSync(cmd).toString().trim().split(' '));
  console.info('Executing:', cmd);
}

// Exclude jerry2 from serverless deployment
apps = filter(apps, (app) => !['jerry2'].includes(app));

// Exclude seo apps that need stage QA from serverless deployment
apps = filter(apps, (app) => !['content', 'ui-content', 'seo-payload', 'ui-expert-qna'].includes(app));

if (apps.length === 0) {
  // No apps affected, nothing to do.
  console.info('Nothing affected. No deployment needed.');
} else {
  // Go through each app and run stage deploy on it.
  console.info('Will deploy:', apps);

  // Run prebuild step for affected apps
  let prom = execPromise(`npx nx run-many --target=prebuild --projects=${apps.join(',')}`);
  each(apps, (app) => {
    // Ignore none-deployable app https://stackoverflow.com/a/50684147/17359501
    prom = prom.then(() => execPromise(`npm run ${app}:deploy:stage --if-present`));
  });
}
