// Webpack 5 运行于 Node.js v10.13.0+ 的版本。
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin'); // 打包之前清空dist目录

module.exports = {
  mode: 'development',
  entry: {
    index: './index.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    static: {
      directory: path.join(__dirname, './dist'),
    },
    port: 9001,
    compress: true,
    open: true,
  },
  module: {
    rules: [
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html', // 指定 HTML 模板文件路径
      scriptLoading: 'blocking', // 不添加defer
      inject: 'body',
    }),
    new CleanWebpackPlugin(),
  ],
}