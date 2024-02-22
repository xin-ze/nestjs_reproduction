/* eslint-disable */
/**
 * To convert vimeo url to vimeo cover image url
 *
 * Example:
 * - From: `https://player.vimeo.com/video/453692999
 * - To: https://i.vimeocdn.com/video/954815732_295x166.webp
 *
 * Input blank line to end inputs and output result
 * To exit, press Ctrl + C
 */

const fetch = require('cross-fetch');
const readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.prompt();

rl.on('line', function(cmd) {
  if (cmd.trim() !== '') {
    getCover(cmd);
  }
});

async function getCover(line) {
  const response = await fetch(`https://vimeo.com/api/oembed.json?url=${line.trim()}`);

  const res = await response.json();
  console.log(res.thumbnail_url);
}
