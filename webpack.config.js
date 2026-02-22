const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const webpack = require('webpack');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    mode: isProduction ? 'production' : 'development',

    context: __dirname,

    entry: './src/index.tsx',

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction
        ? 'static/js/[name].[contenthash].js'
        : 'static/js/[name].js',
      chunkFilename: isProduction
        ? 'static/js/[name].[contenthash].chunk.js'
        : 'static/js/[name].chunk.js',
      publicPath: '/',
      clean: true
    },

    devtool: isProduction ? 'source-map' : 'eval-source-map',

    devServer: {
      port: 3000,
      static: path.join(__dirname, 'dist'),
      hot: true,
      open: true,
      historyApiFallback: true,
      compress: true,
    },

    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      }
    },

    module: {
      rules: [
        {
          test: /\.[tj]sx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader'
          }
        },

        {
          test: /\.(png|jpg|jpeg|gif|svg)$/i,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 8 * 1024
            }
          },
          generator: {
            filename: 'static/media/[name].[hash][ext]'
          }
        },

        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'static/fonts/[name].[hash][ext]'
          }
        },

        {
          test: /\.module\.css$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                modules: {
                  localIdentName: '[local]__[hash:base64:5]',
                },
              },
            },
          ],
        },

        {
          test: /\.css$/,
          exclude: /\.module\.css$/,
          use: ['style-loader', 'css-loader'],
        },

        {
          test: /\.md$/,
          type: 'asset/source'
        }
      ]
    },

    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all'
          }
        }
      },
      runtimeChunk: 'single'
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: './index.html',
        minify: isProduction
      }),

      new Dotenv({
        path: './.env',
        safe: true,
        systemvars: true
      }),

      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(
          isProduction ? 'production' : 'development'
        )
      })
    ]
  }
};