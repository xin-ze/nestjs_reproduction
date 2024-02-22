import { offsetFromRoot, Tree, updateJson } from '@nrwl/devkit';

import { NormalizedSchema } from '../schema';

export function updateJestConfig(host: Tree, options: NormalizedSchema) {
  if (options.unitTestRunner !== 'jest') {
    return;
  }

  updateJson(host, `${options.appProjectRoot}/tsconfig.spec.json`, (json) => {
    const offset = offsetFromRoot(options.appProjectRoot);
    json.files = [
      `${offset}node_modules/@nrwl/react/typings/cssmodule.d.ts`,
      `${offset}node_modules/@nrwl/react/typings/image.d.ts`,
    ];
    return json;
  });

  const configPath = `${options.appProjectRoot}/jest.config.js`;
  const originalContent = host.read(configPath)?.toString() || '';
  const content = originalContent.replace(
    'transform: {',
    "transform: {\n    '^(?!.*\\\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',"
  );
  host.write(configPath, content);
}
