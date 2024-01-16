const TIME_OUT = 60 * 1000; // 接口超时时长
const env = process.env.NODE_ENV || 'production';
/**
 * 网关配置
 */
const gateWayConfig: {
  [key: string]: { BASE_URL: string; PUBLIC_PATH: string };
} = {
  // /energy-ems
  development: {
    BASE_URL: '/energy/ems-api',
    PUBLIC_PATH: '/',
  },
  production: {
    BASE_URL: '/energy/ems-api',
    PUBLIC_PATH: '/energy/ems/ems-web',
  },
};

export default { ...gateWayConfig[env], TIME_OUT };
