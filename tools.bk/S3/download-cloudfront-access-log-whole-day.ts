/* eslint-disable @typescript-eslint/no-var-requires,@typescript-eslint/ban-ts-comment,no-console */
/**
 * This script download cloudfront access log from s3 and bundle into one log file for a date range
 * (need aws login before usage)
 * usage:
 * npm run ts tools/S3/download-cloudfront-access-log-whole-day.ts 2021-05-05 2021-05-07
 */

import moment from 'moment';

const fs = require('fs');

const aws = require('aws-sdk');
const { ungzip } = require('node-gzip');

const startDate = process.argv[2];
const endDate = process.argv[3] || startDate;

const s3 = new aws.S3({
  apiVersion: '2006-03-01',
});

const main = async () => {
  // date format: 2021-05-05
  console.log(`Start download log of date: ${startDate} to ${endDate}`);

  // loop date
  for (let m = moment(startDate); m.diff(endDate, 'days') <= 0; m.add(1, 'days')) {
    const d = m.format('YYYY-MM-DD');
    const params = {
      Bucket: 'cdn-logs-combined',
      // MaxKeys: 2,
      Prefix: 'cdn-prod/E1OS8QLGM6XO48.' + d,
    };

    console.log(`Start download log of date: ${d}`);
    const promiseDay = new Promise((resolve) => {
      s3.listObjectsV2(params, async function (err, data) {
        if (err) {
          console.log(err, err.stack);
        } else {
          console.log(data);

          const promises = data.Contents.sort((a, b) => a.LastModified - b.LastModified).map((s3objectParams) => {
            return new Promise((resolve, reject) => {
              s3.getObject(
                {
                  Bucket: 'cdn-logs-combined',
                  Key: s3objectParams.Key,
                },
                function (err, data) {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(data);
                  }
                }
              );
            });
          });

          await Promise.all(promises).then(async (results) => {
            console.log('results');
            const logs = [];
            for (const result of results) {
              // @ts-ignore
              const decompressed = await ungzip(result.Body);
              // @ts-ignore
              logs.push(decompressed.toString());
              console.log(logs.length + ' / ' + results.length);
            }
            fs.writeFileSync('./' + d + '.log', logs.join('\n'));
          });

          resolve(null);
        }
      });
    });

    await promiseDay;
  }
};

void main();
