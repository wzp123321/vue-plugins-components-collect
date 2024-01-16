const env = process.env.NODE_ENV || 'production';

const PUBLIC_PATH = env === 'production' ? '/tenant-toc' : '/';

// webpack相关配置
const webpackConfig = {
  PORT: '9898',
  // PROXY_URL: 'http://192.168.50.24:8203/',
  PROXY_URL: 'http://192.168.40.17:8206/',
  // PROXY_URL: 'http://192.168.50.249:8206/',
  // PROXY_URL: 'http://192.168.40.17:8205/',
  IS_PRODUCTION: env === 'production',
};

module.exports = Object.assign(webpackConfig, { PUBLIC_PATH });
