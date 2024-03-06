/* eslint-disable */
export default {
  displayName: 'payload-types',
  preset: '../../../jest.seo-submodule.preset.swc.ts',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/seo-submodule/payload-types',
};
