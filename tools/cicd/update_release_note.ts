/* eslint-disable no-console, no-control-regex*/
import fs from 'fs';
import assert from 'assert';

import { GoogleSpreadsheet } from 'google-spreadsheet';
import moment from 'moment';

const AppWorksheetTitle = {
  signup: 'Signup',
  headless: 'Headless',
  'signup-service': 'signup-service',
  quoting: 'Sls-Quoting',
  sms: 'Serverless-SMS',
  car: 'car-service',
};

// Read the credentials and spreadsheet information from environment variables
const {
  GOOGLE_SPREADSHEET_CLIENT_EMAIL: client_email,
  GOOGLE_SPREADSHEET_PRIVATE_KEY: private_key,
  GOOGLE_SPREADSHEET_RELEASENOTES_ID: spreadsheet_id,
  GOOGLE_SPREADSHEET_WORKSHEET_TITLE: worksheet_title,
  ACTOR: actor,
  VERSION: version,
} = process.env;

assert(client_email, 'GOOGLE_SPREADSHEET_CLIENT_EMAIL is required');
assert(private_key, 'GOOGLE_SPREADSHEET_PRIVATE_KEY is required');
assert(spreadsheet_id, 'GOOGLE_SPREADSHEET_RELEASENOTES_ID is required');
assert(worksheet_title, 'GOOGLE_SPREADSHEET_WORKSHEET_TITLE is required');
assert(version, 'VERSION is required');

const credentials = { client_email, private_key: private_key.replace(/\\n/g, '\n') };
const doc = new GoogleSpreadsheet(spreadsheet_id);
const commonTitle = 'Common App';
const regex = /#(\d+)/g;

const formatNotes = () => {
  const notes = fs.readFileSync(__dirname + '/../../ReleaseNotes.md', 'utf8');
  const list = notes.split('\n');
  const formatted = list.map((log) => {
    const PRNumberMatch = [...log.matchAll(regex)].pop();
    if (PRNumberMatch) {
      return log.replace(/^- /, `- PR ${PRNumberMatch[1]} `);
    }
    return log;
  });
  return formatted.join('\n');
};

const main = async () => {
  await doc.useServiceAccountAuth(credentials);
  console.info('[Google Sheet]: Authorized successfully!');
  await doc.loadInfo(); // loads document properties and worksheets
  console.info('[Google Sheet]: Read sheet data successfully!');

  let title = AppWorksheetTitle[worksheet_title];
  if (!title) {
    console.info(`No Sheet match ${worksheet_title} use Common App`);
    title = 'Common App';
  }

  const sheet = doc.sheetsByTitle[title];
  const notes = formatNotes();
  let newLog = [moment().format('YYYY-MM-DD'), version ?? '', actor ?? '', notes ?? 'Empty'];
  if (title === commonTitle) {
    newLog = [
      worksheet_title,
      moment().format('YYYY-MM-DD'),
      moment().format('YYYY-MM-DD HH:mm:ss'),
      version ?? '',
      actor ?? '',
      notes ?? '',
    ];
  }
  await sheet.insertDimension('ROWS', { startIndex: 1, endIndex: 2 }, false);
  await sheet.addRow(newLog);
  console.info('[Google Sheet]: Updated release notes sheet successfully!');
};

main().catch((err) => console.info('error: ', err));
