/**
 * Walk through all project.json file and add test options.outputFile
 * @example node tools/code_gen/modify_test_config.js
 */
const fg = require('fast-glob');
const path = require('path');
const { updateJson, formatFiles } =require('@nrwl/devkit');
const Tree = require('nx/src/generators/tree');

const main = async () => {
  const paths = await fg(['apps/*/project.json', 'libs/*/project.json']);
  console.log(paths);
  const root = path.join(__dirname, '../..');
  const tree = new Tree.FsTree(root);
  for(const path of paths){
    const name = path.replace(/(libs|apps)\//, '').replace(/\/project\.json/, '')
    updateJson(tree, path, (json) => {
      if(!json.targets.test){
        return json
      }
      json.targets.test.options.outputFile=`tmp/${name}.output.json`
      return json;
    });
    await formatFiles(tree)
  }

  // Flush changes
  Tree.flushChanges(root, tree.listChanges())
};

main()
