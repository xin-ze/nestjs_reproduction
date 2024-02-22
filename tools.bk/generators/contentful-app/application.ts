import { join } from 'path';

import { formatFiles, joinPathFragments, Tree, updateJson, names, offsetFromRoot, generateFiles } from '@nrwl/devkit';
import { runTasksInSerial } from '@nrwl/workspace/src/utilities/run-tasks-in-serial';
import { lintProjectGenerator, Linter } from '@nrwl/linter';

import { NormalizedSchema, Schema } from './schema';
import { updateJestConfig } from './lib/update-jest-config';
import { normalizeOptions } from './lib/normalize-options';
import { addProject } from './lib/add-project';

async function addLinting(host: Tree, options: NormalizedSchema) {
  const lintTask = await lintProjectGenerator(host, {
    linter: Linter.EsLint,
    project: options.projectName,
    tsConfigPaths: [joinPathFragments(options.appProjectRoot, 'tsconfig.app.json')],
    eslintFilePatterns: [`${options.appProjectRoot}/**/*.{ts,tsx,js,jsx}`],
    skipFormat: true,
  });

  updateJson(host, joinPathFragments(options.appProjectRoot, '.eslintrc.json'), (json) => {
    json.extends = ['plugin:@nrwl/nx/react'].concat(json.extends);
    return json;
  });

  return runTasksInSerial(lintTask);
}

export async function applicationGenerator(host: Tree, schema: Schema) {
  const options = normalizeOptions(host, schema);

  const templateVariables = {
    ...names(options.name),
    ...options,
    tmpl: '',
    offsetFromRoot: offsetFromRoot(options.appProjectRoot),
  };

  generateFiles(host, join(__dirname, './files'), options.appProjectRoot, templateVariables);

  addProject(host, options);
  const lintTask = await addLinting(host, options);
  updateJestConfig(host, options);

  await formatFiles(host);

  return runTasksInSerial(lintTask);
}

export default applicationGenerator;
