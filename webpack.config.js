// @flow weak
const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');

const isDev = process.env.NODE_ENV !== 'production';

module.exports = {
  entry: isDev ? path.resolve(__dirname, 'src/index-dev.js') : path.resolve(__dirname, 'src/index.js'),
  devServer: {
    historyApiFallback: true,
    inline: true,
    hot: true,
    open: false,
    disableHostCheck: true,
    port: 3000,
    proxy: {
      '/api/conductor': {
        target: 'http://localhost:3001',
        secure: false,
      },
      // Uncomment below settings when testing frinx-workflow-ui running on host and talking to workflow-proxy in net-auto
      /*
      '/': {
        target: 'http://localhost:5000',
        secure: false,
      }
      */
    },
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    library: 'frinxWorkflowUI',
    libraryTarget: 'umd',
    publicPath: '/',
    // Substitute publicPath above with settings below when testing frinx-workflow-ui running on host and talking to workflow-proxy in net-auto
    /*
    publicPath: '/workflow/frontend/',
    */
  },
  devtool: isDev ? 'source-map' : undefined,
  module: {
    rules: [
      {
        test: /\.(css|scss})$/,
        loader: 'style-loader!css-loader!sass-loader',
      },
      {
        test: /\.m?js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.(jpe?g|gif|png|svg|)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
      {
        test: /\.(woff|woff2|ttf|eot)$/,
        use: 'file-loader?name=fonts/[name].[ext]!static',
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: './public/index.html',
      filename: './index.html',
    }),
  ],
  externals: isDev
    ? undefined
    : {
        react: 'react',
        reactDOM: 'react-dom',
      },
};
