import fg from 'fast-glob';
import type { Tree } from '@nrwl/devkit';
import { applyTransform } from 'jscodeshift/src/testUtils';
import type { API, FileInfo } from 'jscodeshift';
import type { namedTypes } from 'ast-types';

/**
 * `foo: string | null;` => `foo?: string | null;`
 * @param file
 * @param api
 * @returns
 */
export function optionalizePropertyWithNullUnionType(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);

  root
    .find(j.TSPropertySignature)
    .find(j.TSUnionType)
    .find(j.TSNullKeyword)
    .filter((x) => {
      const possibleUnionTypeNode = x.parent;
      if (possibleUnionTypeNode.value.type !== 'TSUnionType') {
        return false;
      }
      const possiblePropertySignatureNode = x.parent.parent.parent;
      if (possiblePropertySignatureNode.value.type !== 'TSPropertySignature') {
        return false;
      }

      return true;
    })
    .map((x) => x.parent.parent.parent)
    .replaceWith((nodePath) => {
      const node = nodePath.node as namedTypes.TSPropertySignature;

      node.optional = true;

      return node;
    });

  return root.toSource();
}

/**
 * `string | null` => `string`
 *
 * @param file
 * @param api
 * @returns
 */
export function removeNullInUnionType(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);

  root.find(j.TSUnionType).replaceWith((nodePath) => {
    const node = nodePath.node as namedTypes.TSUnionType;

    if (node.types[node.types.length - 1].type === 'TSNullKeyword') {
      node.types.length -= 1;
    }

    return node;
  });

  return root.toSource();
}

const filePatterns = ['{apps,libs}/seo-submodule/**/__generated__/*.ts', '__generated__/*.ts'];

/**
 * This function is used to clean up the generated nulls from the payload-api generator.
 * It turns `foo: string | null;` into `foo?: string;`
 */
async function tsCleanGeneratedNulls(tree: Tree) {
  const filePaths = await fg(filePatterns, { dot: true });

  filePaths.forEach((filePath) => {
    const input = tree.read(filePath)?.toString() || '';
    const transformOptions = {};
    let output = applyTransform({ default: optionalizePropertyWithNullUnionType, parser: 'ts' }, transformOptions, {
      source: input,
      path: filePath,
    });

    output = applyTransform({ default: removeNullInUnionType, parser: 'ts' }, transformOptions, {
      source: output,
      path: filePath,
    });

    tree.write(filePath, output);
  });
}

export default tsCleanGeneratedNulls;
