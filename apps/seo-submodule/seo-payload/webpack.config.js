const path = require('path');

const { compact } = require('lodash');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
module.exports = (config, _context) => {
  return {
    ...config,
    entry: {
      ...config.entry,
      config: './apps/seo-submodule/seo-payload/src/payload.config.ts',
    },
    output: {
      ...config.output,
      filename: '[name].js',
    },
    module: {
      ...config.module,
      rules: compact([
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
  };
};
