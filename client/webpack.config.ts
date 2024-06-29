import path from 'path'
import { Configuration, DefinePlugin } from 'webpack'
import CompressionPlugin from 'compression-webpack-plugin'
import CopyPlugin from 'copy-webpack-plugin'
import 'webpack-dev-server'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'

const config: (env: Record<string, string>) => Configuration = (env) => {
  const getVariable = (name: string) => env[name] ?? process.env[name]

  const IS_DEV = getVariable('NODE_ENV') !== 'production'
  const IS_PERF = getVariable('BUNDLE_SIZE') === 'true'

  return {
    target: 'web',
    mode: IS_DEV ? 'production' : 'development',
    devtool: IS_DEV ? 'source-map' : undefined,
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
        progress: true,
      },
      open: false,
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        { test: /\.css$/, use: ['style-loader', 'css-loader'] },
        {
          test: /\.scss$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                import: false,
                modules: true,
              },
            },
            'sass-loader',
          ],
          include: /\.module\.scss$/,
        },
        {
          test: /\.scss$/,
          use: ['style-loader', 'css-loader', 'sass-loader'],
          exclude: /\.module\.scss$/,
        },
        {
          test: /\.(png|jp(e*)g|svg|gif)$/,
          use: ['file-loader'],
        },
      ],
    },
    output: {
      filename: '[name].[contenthash].js',
      path: path.resolve(__dirname, 'build'),
      publicPath: '/',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: 'public/template.html',
        minify: {
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
      new CopyPlugin({
        patterns: [{ from: 'public' }],
      }),
      IS_PERF && new BundleAnalyzerPlugin(),
      new DefinePlugin({
        'process.env.REACT_APP_SERVER_HOST': JSON.stringify(getVariable('REACT_APP_SERVER_HOST')),
        'process.env.REACT_APP_KEYCLOAK_HOST': JSON.stringify(
          getVariable('REACT_APP_KEYCLOAK_HOST'),
        ),
        'process.env.REACT_APP_KEYCLOAK_REALM_NAME': JSON.stringify(
          getVariable('REACT_APP_KEYCLOAK_REALM_NAME'),
        ),
      }),
      new CleanWebpackPlugin(),
      !IS_DEV &&
        new CompressionPlugin({
          filename: '[path][base].gz',
          algorithm: 'brotliCompress',
          test: /\.(js|css|html|svg)$/,
          threshold: 10240,
          minRatio: 0.8,
        }),
    ].filter(Boolean),
    optimization: {
      minimize: !IS_DEV,
      runtimeChunk: {
        name: 'runtime',
      },
      splitChunks: {
        chunks: 'async',
        minSize: 30000,
        minChunks: 1,
        maxAsyncRequests: 5,
        maxInitialRequests: 3,
        cacheGroups: {
          default: {
            name: 'common',
            chunks: 'initial',
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
        },
      },
      minimizer: [`...`, new CssMinimizerPlugin()],
    },
    cache: {
      type: 'filesystem',
    },
  }
}

export default config
