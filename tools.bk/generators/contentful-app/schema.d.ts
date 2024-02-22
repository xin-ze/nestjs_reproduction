export interface Schema {
  name: string;
  skipFormat: boolean;
  directory?: string;
  tags?: string;
  unitTestRunner: 'jest' | 'none';
  babelJest: boolean;
  e2eTestRunner: 'cypress' | 'none';
  pascalCaseFiles?: boolean;
  classComponent?: boolean;
  routing?: boolean;
  skipWorkspaceJson?: boolean;
  js?: boolean;
  globalCss?: boolean;
}

export interface NormalizedSchema extends Schema {
  projectName: string;
  appProjectRoot: string;
  fileName: string;
  hasStyles: boolean;
}
