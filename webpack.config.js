const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  context: __dirname,
  entry: './src/index.tsx',
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'app.bundle.js',
    clean: true,
    publicPath: '/'
  },
  devServer: {
    port: 3000,
    static: path.join(__dirname, 'dist'),
    hot: true,
    open: true,
    historyApiFallback: true,
    compress: true
  },
  module: {
    rules: [
      { test: /\.[tj]sx?$/, use: ['babel-loader'] },
      { test: /\.(png|svg|jpg|gif)$/, use: ['file-loader'] },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\.md$/, use: [require.resolve('raw-loader')] }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './index.html' }),
  ]
};
