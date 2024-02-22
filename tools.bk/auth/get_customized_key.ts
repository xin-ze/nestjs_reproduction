/* eslint-disable no-console */
import { customizeEncrypt } from 'jerry-encrypt';

if (process.argv.length != 3) {
  console.error('usage: npm run get_customized_key <KEY>');
} else {
  console.log(customizeEncrypt(process.argv[2]));
}
