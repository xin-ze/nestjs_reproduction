/**
 * Aggregate all test report file and generate normalized test build time map and override .build.time.json file
 */
import fs from 'fs';
import path from 'path';

const tmpRoot = path.join(__dirname, '../../tmp');
/**
 * Skip key regex rules
 */
const skipKeys = [/-e2e$/, /^seo-/, /ui-content/, /ui-expert-qna/, /signup/];

const sum = (numbers) => numbers.reduce((total, cur) => total + cur, 0);

const main = () => {
  const files = fs.readdirSync(tmpRoot).filter((fn) => fn.endsWith('.output.json'));
  const buildTimeMap = {};
  for (const file of files) {
    const name = file.split('.output.json')[0];
    const timeUsed = getTimeUsed(file);
    buildTimeMap[name] = timeUsed;
  }
  printTop10Duration(buildTimeMap);
  console.log(buildTimeMap);
  const normalized = normalizeDuration(buildTimeMap);
  console.log(normalized);
  mergeBuildTimeJson(normalized);
};

/**
 * Normalize test build time to minute. least time set to 0.1
 */
function normalizeDuration(timeMap: Record<string, number>) {
  return Object.keys(timeMap).reduce((prev, cur) => {
    const skip = skipKeys.map((rule) => rule.test(cur)).some((val) => val);
    if (skip) {
      return prev;
    }
    prev[cur] = Math.ceil(timeMap[cur] / 6000) / 10 || 0.1;
    return prev;
  }, {});
}

/**
 * Print top 10 duration keys
 */
function printTop10Duration(timeMap: Record<string, number>) {
  const top10Keys = Object.keys(timeMap)
    .sort((a, b) => timeMap[b] - timeMap[a])
    .slice(0, 10);
  console.log(
    'Top 10 duration',
    top10Keys.map((key) => `${key}: ${timeMap[key]}`)
  );
}

/**
 * Get time used in milliseconds from jest output json file
 */
function getTimeUsed(file: string) {
  const out = fs.readFileSync(path.join(tmpRoot, file), 'utf-8');
  const json = JSON.parse(out);
  // Get the start time
  const startTime = json.startTime;

  // Get the largest end time from the test results
  if (json.testResults.length === 0) {
    // No test results, return 0
    return 0;
  }
  const endTime = Math.max(...json.testResults.map((result) => result.endTime));

  // Calculate the total used time
  const totalUsedTime = endTime - startTime;
  return totalUsedTime;
}

/**
 * Merge build time map to .build.time.json
 */
function mergeBuildTimeJson(timeMap: Record<string, number>) {
  const original = JSON.parse(fs.readFileSync('.build.time.json', 'utf-8'));
  fs.writeFileSync('.build.time.json', JSON.stringify({ ...original, ...timeMap }, null, 2));
}

main();
