/* eslint-disable */
/**
 * To convert style inside js to css
 *
 * Example:
 * - From: marginRight: 'auto',
 * - To: margin-right:  auto;
 *
 * Input blank line to end inputs and output result
 */

const readline = require('readline');
const camelToCssCase = str => str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
const rightReplace = str => str.replace(/\s*'(.+)',/, '$1;');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
var input = [];

rl.prompt();

rl.on('line', function(cmd) {
  if (cmd.trim() === '') {
    for (const inputElement of input) {
      styleToCss(inputElement);
    }
    process.exit(0);
  }

  input.push(cmd);
});

function styleToCss(line) {
  if (!line.includes(':')) {
    return line;
  }
  let [left, right] = line.split(':');
  console.log(`${camelToCssCase(left)}: ${rightReplace(right)}`);
}
