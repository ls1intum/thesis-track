const path = require('path')
const { DefinePlugin } = require('webpack')
const CompressionPlugin = require('compression-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')
const WebpackBar = require('webpackbar')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const config = (env) => {
  const getVariable = (name) => env[name] ?? process.env[name]

  const IS_DEV = getVariable('NODE_ENV') === 'development'
  const IS_PERF = getVariable('BUNDLE_SIZE') === 'true'
  const IS_CI = getVariable('CI') === '1'

  return {
    target: 'web',
    mode: IS_DEV ? 'development' : 'production',
    devtool: IS_DEV ? 'source-map' : false,
    entry: './src/index.tsx',
    devServer: {
      static: {
        directory: path.join(__dirname, 'public'),
      },
      compress: true,
      hot: true,
      historyApiFallback: true,
      port: 3000,
      client: {
        progress: false,
      },
      open: false,
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/i,
          use: {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              configFile: 'tsconfig.json',
              compilerOptions: {
                module: 'ESNext',
              },
            },
          },
          exclude: /node_modules/,
        }, {
          test: /\.css$/i,
          sideEffects: true,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                modules: {
                  auto: /\.module\.css$/,

                }
              }
            },
            "postcss-loader"
          ],
        },
        {
          test: /\.(?:ico|gif|png|jpg|jpeg|svg|ttf|eot|woff2?|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'static/assets/[name][hash][ext]',
          },
        },
      ],
    },
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: 'static/js/[name].[contenthash].js',
      sourceMapFilename: 'static/js/[name].[contenthash].js.map',
      chunkFilename: 'static/js/[name].[contenthash].js',
      assetModuleFilename: 'static/assets/[name].[hash][ext]',
      publicPath: '/',
      crossOriginLoading: 'anonymous',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    plugins: [
      !IS_CI && !IS_DEV && new WebpackBar({
        reporter: 'fancy',
      }),
      IS_PERF && new BundleAnalyzerPlugin(),
      new HtmlWebpackPlugin({
        template: 'src/index.html',
        minify: IS_DEV ? undefined : {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        },
      }),
      new MiniCssExtractPlugin({
        filename: IS_DEV ? 'static/css/[name].css' : 'static/css/[name].[contenthash].css',
        chunkFilename: IS_DEV ? 'static/css/[id].css' : 'static/css/[id].[contenthash].css',
      }),
      new CopyPlugin({
        patterns: [{ from: 'public' }],
      }),
      new DefinePlugin({
        process: {
          env: {
            SERVER_HOST: JSON.stringify(getVariable('SERVER_HOST')),
            KEYCLOAK_HOST: JSON.stringify(getVariable('KEYCLOAK_HOST')),
            KEYCLOAK_REALM_NAME: JSON.stringify(getVariable('KEYCLOAK_REALM_NAME')),
            KEYCLOAK_CLIENT_ID: JSON.stringify(getVariable('KEYCLOAK_CLIENT_ID'))
          }
        },
      }),
      new ForkTsCheckerWebpackPlugin({
        async: IS_DEV,
        typescript: {
          configFile: path.resolve(__dirname, 'tsconfig.json'),
        },
      }),
      new CleanWebpackPlugin(),
      !IS_DEV && new CompressionPlugin({
        filename: '[path][base].gz',
        algorithm: 'gzip',
        test: /\.(js|css|html|svg)$/,
        threshold: 10240,
        minRatio: 0.8,
      }),
    ].filter(Boolean),
    optimization: {
      minimize: !IS_DEV,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            ecma: 2016,
            output: {
              comments: false,
            },
          },
          parallel: true,
          extractComments: false,
        }),
        new CssMinimizerPlugin(),
      ],
      splitChunks: {
        chunks: 'all',
        minSize: 30000,
        minChunks: 1,
        maxAsyncRequests: 5,
        maxInitialRequests: 3,
        cacheGroups: {
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: -10,
            reuseExistingChunk: true,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      },
      runtimeChunk: {
        name: 'runtime',
      },
      usedExports: true,
    },
    cache: {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
    },
  }
}

if(process.env.BUILD_SPEED === 'true') {
  const smp = new SpeedMeasurePlugin()

  module.exports = smp.wrap(config)
} else {
  module.exports = config
}
