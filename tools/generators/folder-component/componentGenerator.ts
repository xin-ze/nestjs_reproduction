import { formatFiles, generateFiles, getProjects, joinPathFragments, logger, names, Tree } from '@nrwl/devkit';

import { Schema } from './schema';

interface NormalizedSchema extends Schema {
  projectSourceRoot: string;
  componentName: string;
}

/**
 * Normalize options and create component files
 * @param host
 * @param schema
 * @returns
 */
export async function componentGenerator(host: Tree, schema: Schema) {
  const options = await normalizeOptions(host, schema);
  createComponentFiles(host, options);

  return formatFiles(host);
}

/**
 * Generate files from templates in a specific directory
 * @param host
 * @param options
 */
function createComponentFiles(host: Tree, options: NormalizedSchema) {
  const componentDir = options.directory
    ? joinPathFragments(options.projectSourceRoot, options.directory)
    : options.projectSourceRoot;

  generateFiles(host, joinPathFragments(__dirname, './files'), componentDir, {
    ...options,
    tmpl: '',
  });
}

/**
 * Validate and normalize options
 * @param host
 * @param options
 * @returns
 */
async function normalizeOptions(host: Tree, options: Schema): Promise<NormalizedSchema> {
  assertValidOptions(options);

  const { className: componentName } = names(options.name);
  const project = getProjects(host).get(options.project);

  if (!project) {
    logger.error(`Cannot find the ${options.project} project. Please double check the project name.`);
    throw new Error();
  }

  const { sourceRoot: projectSourceRoot } = project;

  if (!projectSourceRoot) {
    logger.error(`projectSourceRoot of project ${options.project} cannot be empty`);
    throw new Error();
  }

  const directory = await getDirectory(host, options);

  return {
    ...options,
    directory,
    componentName,
    projectSourceRoot,
  };
}

/**
 * Get the target directory from options
 * @param host
 * @param options
 * @returns
 */
async function getDirectory(host: Tree, options: Schema) {
  const componentName = names(options.name).className;
  const workspace = getProjects(host);

  let baseDir: string;
  if (options.directory) {
    baseDir = options.directory;
  } else {
    const project = workspace.get(options.project);

    baseDir = project?.projectType === 'application' ? 'components' : 'lib';
  }
  return joinPathFragments(baseDir, componentName);
}

function assertValidOptions(options: Schema) {
  const slashes = ['/', '\\'];
  slashes.forEach((s) => {
    if (options.name.indexOf(s) !== -1) {
      const [name, ...rest] = options.name.split(s).reverse();
      let suggestion = rest.map((x) => x.toLowerCase()).join(s);
      if (options.directory) {
        suggestion = `${options.directory}${s}${suggestion}`;
      }
      throw new Error(
        `Found "${s}" in the component name. Did you mean to use the --directory option (e.g. \`nx g c ${name} --directory ${suggestion}\`)?`
      );
    }
  });
}

export default componentGenerator;
