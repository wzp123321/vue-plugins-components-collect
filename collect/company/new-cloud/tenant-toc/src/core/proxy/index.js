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
    const content = fs.readFileSync(resolve('src/core/proxy', 'index.json'), { ENCODE });
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
    // 接口匹配规则自行修改
    ['/energy-tenant-toc']: {
      target: 'toc-test', // 这里必须要有字符串来进行占位
      changeOrigin: true,
      pathRewrite: {
        '^/energy-tenant-toc': '/',
      },
      router: () => (getProxyConfig() || {}).target || '',
    },
    '/ems-style': {
      target: 'http://192.168.50.21:7800/energy/style/',
      changeOrigin: true,
      pathRewrite: {
        '^/ems-style': '/',
      },
    },
  },
};
