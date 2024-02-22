/* eslint-disable */
/**
 * - Add rule to the configuration file of the specified app and lib
 * - Add names to a md file for record
 * - run eslint, save the results in a file for viewing
 * - Automatically generate git log line
 * - @todo: Automatic branch splitting (maybe)
 */

const readline = require('readline');
const path = require('path');
const fs = require('fs');
const process = require('process');
const moment = require('moment');
const { exec } = require('child_process');
const chalk = require('chalk');
const { resolve } = require('path');
const { parse, stringify } = require('comment-json');
const RECORD_MD = 'adding_eslint_rule.log';

const REPO_ROOT = path.resolve(__dirname, '../..');
process.chdir(REPO_ROOT);
const ESLINT_BIN = resolve(__dirname, '../../node_modules/eslint/bin/eslint.js');

const RULES_TO_EXTEND = {
  '@typescript-eslint/no-shadow': [
    'error',
    {
      ignoreFunctionTypeParameterNameValueShadow: true,
      allow: ['err', 'error', 'id', '_', 'data'],
    },
  ],
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
rl.prompt();
rl.on('line', function (cmd) {
  if (cmd.trim() !== '') {
    apps.push(cmd.trim());
  } else {
    rl.close();
    rl.removeAllListeners();
    void processInputs(apps);
  }
});

const apps = [];
const logs = [];

async function processOnePath(p) {
  console.log('processOnePath:', p);
  const eslintJsonFilePath = path.join(p, '.eslintrc.json');
  if (fs.existsSync(eslintJsonFilePath)) {
    const conf = parse(fs.readFileSync(eslintJsonFilePath, 'utf-8'));
    conf.rules = { ...conf?.rules, ...RULES_TO_EXTEND };
    fs.writeFileSync(eslintJsonFilePath, stringify(conf, null, 2) + '\n');
  }

  await execEslintOn(p);
}

async function processInputs(apps) {
  const records = [];
  const recordsShort = [];
  for (const app of apps) {
    if ((app.startsWith('apps/') || app.startsWith('libs/')) && fs.existsSync(app)) {
      await processOnePath(app);
      records.push(app);
      recordsShort.push(app.split('/')[1]);
    } else if (fs.existsSync(path.join('apps', app))) {
      await processOnePath(path.join('apps', app));
      records.push(path.join('apps', app));
      recordsShort.push(app);
    } else if (fs.existsSync(path.join('libs', app))) {
      await processOnePath(path.join('libs', app));
      records.push(path.join('libs', app));
      recordsShort.push(app);
    }
  }
  fs.appendFileSync(
    RECORD_MD,
    ['\n# ' + moment().format('YYYY-MM-DD hh'), ...records, '\n', recordsShort.join(', ')].join('\n')
  );
  process.exit();
}

const errors = new Set();

async function execEslintOn(dir) {
  logAndRecord(chalk.green(`\n\n>>>> check: ${dir}\n`));
  await new Promise((resolve) => {
    exec(
      `NODE_OPTIONS='--max-old-space-size=16384' node ${ESLINT_BIN} ${dir} --fix`,
      { cwd: REPO_ROOT },
      (error, stdout, stderr) => {
        let hasError = false;
        if (error) {
          console.error(`> error: ${error.message}`);
          hasError = true;
          errors.add(dir);
        }
        if (stderr) {
          console.error(`${stderr}`);
          hasError = true;
          errors.add(dir);
        }
        if (/error/gi.test(stdout)) {
          hasError = true;
          errors.add(dir);
        }
        stdout && logAndRecord(`> stdout:\n ${stdout}`);
        if (!hasError) {
          logAndRecord(chalk.blue(` .. ✅ Success`));
        } else {
          logAndRecord(chalk.blue(`\n .. ❌ Failed on ${dir}`));
        }

        resolve(null);
      }
    );
  });
}

function logAndRecord(log) {
  logs.push(log);
  console.log(log);
}
