import { exec } from 'child_process';

import chunk from 'lodash/chunk';

/**
 * Executes a shell command with live (unbuffered) output.
 *
 * @param cmd - Command to execute.
 */
export const execPromise = (cmd: string): Promise<void> =>
  new Promise((resv) => {
    const cmdProc = exec(cmd);
    cmdProc.stdout?.on('data', (data) => process.stdout.write(data.toString()));
    cmdProc.stderr?.on('data', (data) => process.stderr.write(data.toString()));
    cmdProc.on('exit', (code) => {
      if (code === 0 || code === null) {
        resv();
        return;
      }
      process.exit(code);
    });
  });

/**
 * Run promises in sequence and allow partial concurrent execution
 *
 * @param values
 * @param iter
 * @param concurrency Concurrent execution limit, default is 1
 */
export const chainPromises = async <T, U>(
  values: T[],
  iter: (value: T) => Promise<U>,
  concurrency = 1
): Promise<U[]> => {
  const results: U[] = [];
  const chunks = chunk(values, concurrency);
  await chunks.reduce((acc, cur) => {
    return acc
      .then(() => {
        return Promise.all(cur.map((value) => iter(value)));
      })
      .then((res) => {
        results.push(...res);
      });
  }, Promise.resolve());
  return results;
};
