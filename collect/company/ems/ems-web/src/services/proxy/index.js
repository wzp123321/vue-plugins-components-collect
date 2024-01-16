const fs = require('fs');
const { resolve } = require('path');
const ENCODE = 'utf-8';

function jsonParse(obj) {
  return Function('"use strict";return (' + obj + ')')();
}

/**
 * 获取配置选项 getProxyConfig()
 * @returns {{}|*}
 */
function getProxyConfig() {
  try {
    const content = fs.readFileSync(resolve('src/services/proxy', 'index.json'), { ENCODE });
    const config = jsonParse(content);
    console.log('加载代理配置--------------------------------------', config);
    return config;
  } catch (e) {
    console.log('请检查代理配置文件-------------------------', e);
    return {};
  }
}

module.exports = {
  proxy: {
    '/energy/ems-api': {
      target: 'ems-test', // 这里必须要有字符串来进行占位
      changeOrigin: true, //是否跨域
      pathRewrite: {
        '^/energy/ems-api': '',
      },
      router: () => (getProxyConfig() || {}).target || '',
    },
    '/energy/style': {
      target: 'http://192.168.50.21:7800/',
      changeOrigin: true,
      pathRewrite: {
        '^/energy/style': '/energy/style',
      },
    },
  },
};
