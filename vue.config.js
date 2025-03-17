const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  devServer: {
    open: true, // 自动打开浏览器
    host: 'localhost',
    port: 12350, // 修改为你需要的端口号
    https: false,
    hot: false,
  },
  transpileDependencies: true
})


