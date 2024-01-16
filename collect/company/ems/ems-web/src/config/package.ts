const env = process.env.NODE_ENV || 'production';

const PUBLIC_PATH = env === 'production' ? '/energy/ems/ems-web' : '/';

// webpack相关配置
const webpackConfig = {
  PORT: '8080',
  PROXY_URL: 'http://192.168.50.103:10130/energy/ems-api',
  PROXY_STYLE_URL: 'http://192.168.50.21:7800/energy/style',
  // PROXY_URL: 'http://192.168.50.192:9000/energy-ems',
  // PROXY_URL: 'http://192.168.50.24:8400',
  // PROXY_URL: 'http://192.168.40.63:8400',
  // PROXY_URL: 'http://192.168.50.21:7800/',

  // PROXY_URL: 'http://192.168.50.126:10130',
  IS_PRODUCTION: env === 'production',
};
module.exports = Object.assign(webpackConfig, { PUBLIC_PATH });
