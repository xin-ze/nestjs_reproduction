import path from 'path';

import _ from 'lodash';

export const adminWebpackConfig = (config) => {
  return _.merge({}, config, {
    plugins: [
      ...config.plugins,
      // force exit when build production bundles
      {
        apply: (compiler) => {
          config.mode !== 'development' &&
            compiler.hooks.done.tap('DonePlugin', (stats) => {
              console.log('Compile is done !');
              setTimeout(() => {
                process.exit(0);
              });
            });
        },
      },
    ],
    // Uncomment this to write code to patch-package payload, otherwise everything is cached
    cache: false,
    resolve: {
      alias: {
        '@jerry-serverless/seo-utils': path.resolve(__dirname, '../../../../libs/seo-submodule/seo-utils/src'),
        '@jerry-serverless/payload-utils': path.resolve(__dirname, '../../../../libs/seo-submodule/payload-utils/src'),
        '@jerry-serverless/graphql-helpers': path.resolve(__dirname, '../../../../libs/graphql-helpers/src'),
        '@jerry-serverless/console': path.resolve(__dirname, '../../../../libs/console/src'),
        '@jerry-serverless/promise': path.resolve(__dirname, '../../../../libs/promise/src'),
        react: path.resolve(__dirname, '../../../../node_modules/payload/node_modules/react'),
        'react-dom': path.resolve(__dirname, '../../../../node_modules/payload/node_modules/react-dom'),
        graphql: path.resolve(__dirname, '../../../../node_modules/payload/node_modules/graphql'),
        bull: path.resolve(__dirname, '../../../../apps/seo-submodule/seo-payload/src/mocks/client-side-bull-mock.ts'),
        payload: path.resolve(__dirname, '../node_modules/payload'),
        'payload/config': path.resolve(__dirname, '../node_modules/payload/config'),
        'payload/utilities': path.resolve(__dirname, '../node_modules/payload/utilities'),
      },
    },
    module: {
      rules: _.compact([
        ...config.module.rules,
        process.env.NODE_ENV === 'test' && {
          test: /\.(js|ts)$/,
          loader: '@jsdevtools/coverage-istanbul-loader',
          options: { esModules: true },
          enforce: 'post',
          include: [path.join(__dirname, '../../..', 'apps'), path.join(__dirname, '../../..', 'libs')],
          exclude: [/\.(cy|spec)\.ts$/, /node_modules/],
        },
        {
          test: /\.scss$/,
          use: [
            'style-loader',
            'css-loader',
            'sass-loader',
          ],
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 8192, // 小于8KB的文件将被转换为base64格式
                name: '[name].[hash:7].[ext]', // 输出的文件名格式
                outputPath: 'images/', // 输出的目录
              },
            },
          ],
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader', 'postcss-loader'],
        },
      ]),
    },
  });
};
