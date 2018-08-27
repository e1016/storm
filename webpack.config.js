const path = require('path')

module.exports = {
  entry: './dist/storm.js',
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: './storm.min.js',
    libraryTarget: 'umd',
    umdNamedDefine: true
  }
}
