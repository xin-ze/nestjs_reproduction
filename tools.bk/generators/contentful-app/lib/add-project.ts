import { joinPathFragments, addProjectConfiguration, ProjectConfiguration, TargetConfiguration } from '@nrwl/devkit';

import { NormalizedSchema } from '../schema';

export function addProject(host, options: NormalizedSchema) {
  const project: ProjectConfiguration = {
    root: options.appProjectRoot,
    sourceRoot: `${options.appProjectRoot}/src`,
    projectType: 'application',
    targets: {
      deploy: createDeployTarget(options),
      build: createBuildTarget(options),
      serve: createServeTarget(options),
    },
  };

  addProjectConfiguration(host, options.projectName, {
    ...project,
  });
}

function maybeJs(options: NormalizedSchema, path: string): string {
  return options.js && (path.endsWith('.ts') || path.endsWith('.tsx')) ? path.replace(/\.tsx?$/, '.js') : path;
}

function createDeployTarget(options: NormalizedSchema): TargetConfiguration {
  return {
    executor: '@nrwl/workspace:run-commands',
    options: {
      commands: [
        `nx run ${options.projectName}:build`,
        `npx contentful-app-scripts upload --bundle-dir ${joinPathFragments(
          'dist',
          options.appProjectRoot
        )} --ci --organization-id $CONTENTFUL_ORG_ID --definition-id $CONTENTFUL_APP_DEF_ID --token $CONTENTFUL_ACCESS_TOKEN --comment $(git describe --tags)`,
      ],
      envFile: joinPathFragments(options.appProjectRoot, '.env.prod'),
      parallel: false,
    },
  };
}

function createBuildTarget(options: NormalizedSchema): TargetConfiguration {
  return {
    executor: '@nrwl/web:build',
    outputs: ['{options.outputPath}'],
    options: {
      baseHref: '.',
      outputPath: joinPathFragments('dist', options.appProjectRoot),
      index: joinPathFragments(options.appProjectRoot, 'src/index.html'),
      main: joinPathFragments(options.appProjectRoot, maybeJs(options, `src/main.tsx`)),
      polyfills: joinPathFragments(options.appProjectRoot, maybeJs(options, 'src/polyfills.ts')),
      tsConfig: joinPathFragments(options.appProjectRoot, 'tsconfig.app.json'),
      assets: [
        joinPathFragments(options.appProjectRoot, 'src/favicon.ico'),
        joinPathFragments(options.appProjectRoot, 'src/assets'),
      ],
      styles: [],
      scripts: [],
      webpackConfig: '@nrwl/react/plugins/webpack',
    },
  };
}

function createServeTarget(options: NormalizedSchema): TargetConfiguration {
  return {
    executor: '@nrwl/web:dev-server',
    options: {
      buildTarget: `${options.projectName}:build`,
      port: 3600,
    },
    configurations: {
      production: {
        buildTarget: `${options.projectName}:build:production`,
      },
    },
  };
}
