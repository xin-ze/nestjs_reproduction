/**
 * This script checks all typescript code in apps and libs with tsconfig
 * Will ignore the ones without tsconfig (other languages)
 * If has error, will exit with code -1
 */
/* eslint-disable no-console */

import { join, resolve } from 'path';
import { existsSync, promises, rmdirSync } from 'fs';
import { exec, execSync } from 'child_process';

import axios from 'axios';
import chalk from 'chalk';
import moment from 'moment';
import aws from 'aws-sdk';
import minimist from 'minimist';

const { readdir } = promises;

const TSCONFIG = 'tsconfig.json';
const PACKAGE_JSON = 'package.json';
// const PACKAGE_LOCK_JSON = 'package-lock.json';

const toWalkApps = resolve(__dirname, '../../apps/');
const toWalkAppsSubModule = resolve(__dirname, '../../apps/seo-submodule/');
const toWalkLibs = resolve(__dirname, '../../libs/');
const toWalkLibsSubModule = resolve(__dirname, '../../libs/seo-submodule/');
const distOut = resolve(__dirname, '../../dist/out-tsc');
const tsc = resolve(__dirname, '../../node_modules/typescript/bin/tsc');
const errors = new Set();

const argv = minimist(process.argv.slice(2));
const toCheck = argv._[0] || null;
const doClean = argv.clean || false;
const verbose = argv.tscverbose || false;

let countSuccess = 0;
let countFailed = 0;
const logs: string[] = [];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function logAndRecord(log: string) {
  logs.push(log);
  console.log(log);
}

const BUCKET = 'cdn-logs-combined';
const s3 = new aws.S3({
  apiVersion: '2006-03-01',
});

logAndRecord(`toCheck: ${toCheck || 'all'}`);

// Walk sub-dir of path and run `tsc` in sub-dir
async function walkDirUnder(basePath, errorRecorder: Set<string>) {
  const dirs = await readdir(basePath, { withFileTypes: true });
  for (const dir of dirs) {
    const itemName = dir.name;
    const workPath = resolve(basePath, dir.name);
    // if toCheck got value, only check that one
    if (dir.isDirectory() && !itemName.startsWith('.') && (!toCheck || dir.name === toCheck)) {
      await new Promise((resolve) => {
        logAndRecord(chalk.green(`\n\n>>>> check: ${workPath}\n`));

        if (!existsSync(join(workPath, TSCONFIG))) {
          logAndRecord(chalk.gray(' .. No tsconfig found, skip'));
          resolve(true);
          return;
        }

        if (doClean) {
          logAndRecord(chalk.gray('> CLEANING TSC OUT'));
          execSync(`rm -rf ../../dist/tsc-out`, { cwd: workPath });
        }
        exec(
          `NODE_OPTIONS='--max-old-space-size=16384' ${tsc} -b ${verbose ? '--verbose' : ''} `,
          { cwd: workPath },
          (error, stdout, stderr) => {
            let hasError = false;
            if (error) {
              logAndRecord(`> ${chalk.bgBlue('error')}: ${error.message}`);
              hasError = true;
              errors.add(itemName);
              errorRecorder.add(itemName);
            }
            if (stderr) {
              logAndRecord(`${chalk.bgBlue('> stderr')}:\n${stderr}`);
              hasError = true;
              errors.add(itemName);
              errorRecorder.add(itemName);
            }
            if (/error/gi.test(stdout)) {
              hasError = true;
              errors.add(itemName);
              errorRecorder.add(itemName);
            }
            stdout && logAndRecord(`${chalk.bgBlue('> stdout')}:\n${stdout}`);
            if (!hasError) {
              countSuccess += 1;
              logAndRecord(chalk.blue(` .. ✅ Success`));
            } else {
              countFailed += 1;
              logAndRecord(chalk.blue(`\n .. ❌ Failed on ${workPath}`));
            }

            resolve(true);
          }
        );
      });

      // prevent log intersection
      await sleep(200);
    }
  }
}

// Upload the log file to S3
async function uploadToS3(logContent): Promise<string> {
  console.log(`\n>>>>> upload report\n`);

  const now = moment().format('YYYY-MM-DD_HH-mm-ss');

  const s3ParamsWrite = {
    Bucket: BUCKET,
    Key: `ts-check-report/${now}.log`,
    Body: logContent,
  };

  console.log(`Start to upload log: ${now}`);

  await s3
    .upload(s3ParamsWrite, function (s3Err, data) {
      if (s3Err) {
        console.error(s3Err);
        throw s3Err;
      } else {
        console.log(`File uploaded successfully at ${data.Location}`);
      }
    })
    .promise();

  const preSignParams = {
    Bucket: BUCKET,
    Key: s3ParamsWrite.Key,
    Expires: 129600, //36 hours
  };
  const preSignedUrl = s3.getSignedUrl('getObject', preSignParams);
  return preSignedUrl;
}

// get short url
async function getShortUrl(url: string): Promise<string> {
  const res = await axios.post(
    'https://getjerry.com/s/new',
    {
      url,
      ttl: 360000,
    },
    {
      headers: {
        Authorization: `Jerry-Url-Shortener-Authorization-Token ${process.env.URL_SHORTENER_API_TOKEN}`,
      },
    }
  );
  return res.data.shortUrl;
}

void (async function () {
  if (doClean && existsSync(distOut)) {
    rmdirSync(distOut, { recursive: true });
  }
  const errorsApps = new Set<string>();
  const errorsLibs = new Set<string>();
  await walkDirUnder(toWalkApps, errorsApps);
  await walkDirUnder(toWalkAppsSubModule, errorsApps);
  await walkDirUnder(toWalkLibs, errorsLibs);
  await walkDirUnder(toWalkLibsSubModule, errorsLibs);
  if (process.env.UPLOAD_REPORT) {
    const url = await uploadToS3(logs.join('\n'));
    const shortUrl = await getShortUrl(url);
    console.log(`\n======START-SLACK======\n`);

    // Below console logs will be output to slack notify
    if (errors.size > 0) {
      console.error(chalk.red(`Total success: ${countSuccess}, Failed: ${countFailed}, \n`));
      console.error(chalk.red(`Failed in:\n`));
      errorsApps.size > 0 && console.error(chalk.red(`- Apps: ${Array.from(errorsApps).join(', ')}\n`));
      errorsLibs.size > 0 && console.error(chalk.red(`- Libs: ${Array.from(errorsLibs).join(', ')}\n`));
      console.log(`Check report in ${shortUrl}\n`);
      console.log(`\n======END-SLACK======\n`);
      process.exit(-1);
    } else {
      logAndRecord(chalk.green(`All success\n`));
      console.log(`\n======END-SLACK======\n`);
      process.exit(0);
    }
  } else {
    if (errors.size > 0) {
      console.error(chalk.red(`Failed: ${countFailed}, success: ${countSuccess}\n`));
      console.error(chalk.red(`Failed in: ${Array.from(errors).join(', ')}\n`));
      process.exit(-1);
    } else {
      logAndRecord(chalk.green(`All success\n`));
      process.exit(0);
    }
  }
})();
