const common = require('./webpack.common');
const { CleanWebpackPlugin } = require('clean-webpack-plugin'); // 打包之前清空dist目录

module.exports = {
  ...common,
  
  mode: 'production',
  plugins: [
    new CleanWebpackPlugin(),
  ],
}