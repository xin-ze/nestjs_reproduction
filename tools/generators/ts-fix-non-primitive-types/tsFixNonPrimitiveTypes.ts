import fg from 'fast-glob';
import type { Tree } from '@nrwl/devkit';
import { applyTransform } from 'jscodeshift/src/testUtils';
import type { API, FileInfo } from 'jscodeshift';

const nonPrimitiveTypesMap = new Map([
  // 'DateTime' -> 'string'
  ['DateTime', 'string'],
  // 'JSON' -> 'unknown'
  ['JSON', 'unknown'],
  ['JerryIsoDateTimeScalar', 'string'],
]);

/**
 * eg: `updatedAt: DateTime;` => `updatedAt: string;`
 *
 * @param file
 * @param api
 * @returns
 */
export function transformHandler(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);

  return root
    .find(j.TSTypeReference)
    .replaceWith((nodePath) => {
      const node = nodePath.node;
      if ('name' in node.typeName && nonPrimitiveTypesMap.has(node.typeName?.name)) {
        node.typeName.name = nonPrimitiveTypesMap.get(node.typeName?.name) as string;
      }
      return node;
    })
    .toSource();
}

const filePatterns = ['{apps,libs}/seo-submodule/**/__generated__/*.ts', '__generated__/*.ts'];

/**
 *
 */
async function tsFixNonPrimitiveTypes(tree: Tree) {
  const filePaths = await fg(filePatterns, { dot: true });

  filePaths.forEach((filePath) => {
    const input = tree.read(filePath)?.toString() || '';
    const transformOptions = {};

    const output = applyTransform({ default: transformHandler, parser: 'ts' }, transformOptions, {
      source: input,
      path: filePath,
    });

    tree.write(filePath, output);
  });
}

export default tsFixNonPrimitiveTypes;
