/**
 * Generate imports for images files
 */



const { resolve, join, basename } = require('path');
const { readdir } = require('fs').promises;
const toWalk = resolve(__dirname, '../../apps/seo-submodule/ui-content/lib/assets');
const fs = require('fs');

const capitalize = ([firstChar, ...rest]) => `${firstChar.toUpperCase()}${rest.join('')}`;

async function getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map((dirent) => {
    const res = resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
  }));
  return Array.prototype.concat(...files);
}

getFiles(toWalk).then(files => {
  // console.log(files);
  for (const file of files) {
    let fname = basename(file);

    console.log(`import Img${capitalize(fname.split('.')[0].replace(/ /g,''))} from './assets/${fname}';`);
  }
});
