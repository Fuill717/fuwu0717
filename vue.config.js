const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  devServer: {
    host: '1.94.176.68', // 修改绑定IP地址
    port: 9090,
    // 其他配置...
  },
  transpileDependencies: true,
})


