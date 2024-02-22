/**
 * This script print a pre-sign S3 url for anyone to download (expires in 36 hours)
 * usage: npm run ts tools/S3/pre-sign.ts 2021-05-05
 */
import moment from 'moment';

const aws = require('aws-sdk');
const yesterday = moment().subtract(2, 'days').format('YYYY-MM-DD');

const startDate = process.argv[2] || yesterday;

const s3 = new aws.S3({
  apiVersion: '2006-03-01',
});

const main = async () => {
  const params = { Bucket: 'cdn-logs-combined', Key: `daily-compressed-prod/${startDate}.gz`, Expires: 129600 };
  const url = s3.getSignedUrl('getObject', params);
  console.log('The URL is', url);
};

void main();
