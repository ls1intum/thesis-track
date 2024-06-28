import path from 'path'
import { Configuration, EnvironmentPlugin } from 'webpack'

import CopyPlugin from 'copy-webpack-plugin'
import 'webpack-dev-server'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import CompressionPlugin from 'compression-webpack-plugin'

const config: Configuration = {
  mode: (process.env.NODE_ENV as 'production' | 'development' | undefined) ?? 'development',
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
  devtool: 'source-map',
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
    extensions: ['.ts', '.tsx', '.js'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'public/template.html',
    }),
    new CopyPlugin({
      patterns: [{ from: 'public' }],
    }),
    new EnvironmentPlugin({
      REACT_APP_SERVER_HOST: 'http://localhost:8080',
      REACT_APP_KEYCLOAK_HOST: 'http://localhost:8081',
      REACT_APP_KEYCLOAK_REALM_NAME: 'thesis-track',
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
    }),
    new CompressionPlugin({
      filename: '[path][base].gz',
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 10240,
      minRatio: 0.8,
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
    minimize: true,
    minimizer: [
      `...`, // existing minimizers (e.g., TerserPlugin)
      new CssMinimizerPlugin(),
    ],
  },
}

export default config
