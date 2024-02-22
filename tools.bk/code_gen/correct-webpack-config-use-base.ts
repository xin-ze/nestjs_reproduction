/**
 * This script corrects all webpack.config.js that used wrong base config
 * And remove all forceInclude that was added because of this config issue
 *
 * Run: add this line to package.json and run it
 * ```
 * "correct-webpack-config-use-base": "NODE_OPTIONS='--max_old_space_size=4096' npm run ts ./tools/code_gen/correct-webpack-config-use-base.ts"
 * ```
 */
/* eslint-disable no-console */

import { join, resolve } from 'path';
import { existsSync, promises, readFileSync, rmdirSync, writeFileSync } from 'fs';

import chalk from 'chalk';

const { readdir } = promises;

const SERVERLESS_YML = 'serverless.yml';
const WEBPACK_CONFIG = 'webpack.config.js';

const toWalkApps = resolve(__dirname, '../../apps/');
const toCheck = process.argv[2] || null;
const logs: unknown[] = [];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function logAndRecord(log: string) {
  logs.push(log);
  console.log(log);
}

if (toCheck) {
  logAndRecord(`toCheck: ${toCheck}`);
}

// Walk sub-dir of path and run `tsc` in sub-dir
async function walkDirUnder(basePath, errorRecorder: Set<string>) {
  const dirs = await readdir(basePath, { withFileTypes: true });
  for (const dir of dirs) {
    const itemName = dir.name;
    const workPath = resolve(basePath, dir.name);
    // if toCheck got value, only check that one
    if (dir.isDirectory() && (!toCheck || dir.name === toCheck)) {
      await new Promise((resolve) => {
        if (!existsSync(join(workPath, SERVERLESS_YML))) {
          logAndRecord(chalk.gray(' .. No SERVERLESS_YML found, skip', workPath));
          resolve(null);
          return;
        }
        if (!existsSync(join(workPath, WEBPACK_CONFIG))) {
          logAndRecord(chalk.gray(' .. No WEBPACK_CONFIG found, skip', workPath));
          resolve(null);
          return;
        }

        if (!existsSync(join(workPath, 'tsconfig.app.json'))) {
          logAndRecord(chalk.red(' .. No tsconfig.app.json found, skip', workPath));
          resolve(null);
          return;
        }
        logAndRecord(chalk.green(`\n\n>>>> Start: ${workPath}\n`));

        let webpackConfig = readFileSync(join(workPath, WEBPACK_CONFIG), 'utf-8');
        webpackConfig = webpackConfig
          .replace(`baseConfig = require('../../webpack.config')`, `baseConfig = require('../../webpack.base')`)
          .replace(`...baseConfig,`, `...baseConfig('apps/${dir.name}/tsconfig.app.json'),`);
        writeFileSync(join(workPath, WEBPACK_CONFIG), webpackConfig);
        logAndRecord(chalk.green(`\n\n>>>> Corrected: ${workPath}\n`));

        // YML
        let serverlessYml = readFileSync(join(workPath, SERVERLESS_YML), 'utf-8');
        serverlessYml = serverlessYml.replace(/\n {6}forceInclude:\n( {8}- ([\w-_'"/@])+(\s*#.+)?\n)+/g, '\n');
        writeFileSync(join(workPath, SERVERLESS_YML), serverlessYml);
        logAndRecord(chalk.green(`\n\n>>>> Corrected: ${workPath}\n`));

        resolve(null);
      });

      // prevent log intersection
      await sleep(10);
    }
  }
}

void (async function () {
  const errorsApps = new Set<string>();
  await walkDirUnder(toWalkApps, errorsApps);
})();
