import type { Tree } from '@nrwl/devkit';
import { updateJson } from '@nrwl/devkit';
import { generateFiles, joinPathFragments, readProjectConfiguration } from '@nrwl/devkit';
import { camelCase, capitalize } from 'lodash';

import type { Schema } from './schema';

const pascalCase = (str: string) => {
  return capitalize(camelCase(str));
};

const updateDeployScript = (tree: Tree, schema: Schema) => {
  updateJson(tree, joinPathFragments(`apps/${schema.name}`, 'project.json'), (json) => {
    json.targets.deploy = {
      executor: '@nrwl/workspace:run-commands',
      options: {
        cwd: `apps/${schema.name}/scripts`,
        commands: ['bash ./deploy-image', 'bash ./deploy-stack'],
        parallel: false,
      },
    };
    return json;
  });
};

/**
 *
 */
export default async function (tree: Tree, schema: Schema) {
  const libraryRoot = readProjectConfiguration(tree, schema.name).root;

  generateFiles(
    tree, // the virtual file system
    joinPathFragments(__dirname, './files'), // path to the file templates
    libraryRoot, // destination path of the files
    {
      ...schema, // config object to replace variable in file templates
      pascalCase,
      tmpl: '',
    }
  );
  updateDeployScript(tree, schema);
  // await formatFiles(tree);
  return () => {
    // installPackagesTask(tree);
  };
}
