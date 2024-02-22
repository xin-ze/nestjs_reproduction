module.exports = function (config) {
  config.optimization = { minimize: false, concatenateModules: false };

  config.module.rules = [
    {
      test: /\.([jt])sx?$/,
      exclude: /(node_modules)/,
      use: {
        loader: 'swc-loader',
      },
    },
    {
      test: /\.key$/i,
      use: [
        {
          loader: 'raw-loader',
        },
      ],
    },
    {
      test: /\.svg$/,
      use: {
        loader: 'raw-loader',
      },
    },
  ];

  return config;
};
