/**
 * Generate git logs only related with the specific app using nx affected algorithm. And append to ReleaseNotes.md
 *
 * --from: from commit alias
 * --to  : to commit alias
 * --app : check the app related only commits
 *
 * @example Find all commit logs which related with headless app from the last 40 commits:
 *          `npm run ts ./tools/cicd/affected-apps.ts -- --from master~40 --to master --app headless`
 */
import { execSync, exec as execCallback } from 'child_process';
import util from 'util';
import fs from 'fs';

import minimist from 'minimist';
import compact from 'lodash/compact';

import { chainPromises } from './utils';

const exec = util.promisify(execCallback);

const argv = minimist(process.argv.slice(2));
if (!argv.from || !argv.to || !argv.app) {
  console.error(`Generate git logs only related with the specific app using nx affected algorithm. And append to ReleaseNotes.md

--from: from commit alias
--to  : to commit alias
--app : check the app related only commits

@example Find all commit logs which related with headless app from the last 40 commits:
          "npm run ts ./tools/cicd/affected-apps.ts -- --from master~40 --to master --app headless"
`);
  throw Error('Must provide both --from, --to and --app');
}

const MAX_LOG_LENGTH = 50;

const getVersionTime = async (version: string) => (await exec(`git show -s --format=%ct ${version}`)).stdout.trim();

/**
 * Generate commit logs which affected with the app
 */
const main = async (params: { from: string; to: string; app: string }) => {
  const { from, to, app } = params;

  /**
   * Check from and to version timestamp
   */
  const fromVersionTime = await getVersionTime(from);
  const toVersionTime = await getVersionTime(to);

  /**
   * Is from version latter than to version
   */
  const isRevert = Number(fromVersionTime) > Number(toVersionTime);

  /**
   * Generate all the commit pair between from and to
   *
   * @example
   * Commit Tree:
   * [
   *   'e7cd1461ed1f9bb8784871e51da1ff96ae37f1b3', // <-- Latest
   *   '2d784f79afccadcf1590d5a6d9d1b83a51b33c03',
   *   'a5157bff4e97a7f8951db4cdf24995d8d7e556e8'
   * ]
   *
   * Commit Pair:
   * [
   *  [
   *    '2d784f79afccadcf1590d5a6d9d1b83a51b33c03',
   *    'e7cd1461ed1f9bb8784871e51da1ff96ae37f1b3'
   *  ],
   *  [
   *    'a5157bff4e97a7f8951db4cdf24995d8d7e556e8',
   *    '2d784f79afccadcf1590d5a6d9d1b83a51b33c03'
   *  ]
   * ]
   */
  const commits = compact(execSync(`git rev-list ${from}...${to}`).toString().split('\n'));
  // Push the from/to version as the last commit of the commit list
  commits.push(isRevert ? to : from);
  const commitPairs: [string, string][] = [];
  commits.reduce((acc, cur) => {
    commitPairs.push([cur, acc]);
    return cur;
  });

  /**
   * Generate git logs from commit pairs list
   */
  const result = await chainPromises(
    commitPairs,
    async ([from, to]) => {
      try {
        const appsString = await exec(`nx affected:apps --base ${from} --head ${to} --plain`);
        const affectedApps = appsString.stdout.trim().split(' ');
        // Only generate log when affected apps contains current app
        if (affectedApps.includes(app)) {
          const gitLog = await exec(`git log --pretty=format:'- %s (%an)' ${from}...${to}`);
          return gitLog.stdout.trim();
        }
      } catch (e) {
        // Ignore any error
        // eslint-disable-next-line no-console
        console.log(e);
      }
    },
    10
  );

  /**
   * Append logs to ReleaseNotes.md
   */
  const logs = compact(result).join('\n');
  const notes = [...new Set(logs.split('\n'))];
  const logsLength = logs.length;
  const finalLogs = [
    ...notes.slice(0, MAX_LOG_LENGTH),
    logsLength > MAX_LOG_LENGTH ? `(and ${logsLength - MAX_LOG_LENGTH} commits...)` : '',
  ].join('\n');
  const releaseNotesPath = `${__dirname}/../../ReleaseNotes.md`;
  if (isRevert) {
    fs.appendFileSync(releaseNotesPath, '**Reverted commits:**\n');
  }
  fs.appendFileSync(releaseNotesPath, finalLogs);
  // eslint-disable-next-line no-console
  console.log('\x1b[32mAppended to ReleaseNotes.md Done.\x1b[0m');
};

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
void main(argv as any);
