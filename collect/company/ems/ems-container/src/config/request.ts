const TIME_OUT = 60 * 1000; // 接口超时时长
const env = (import.meta.env.VITE_NODE_ENV as string) || 'production';
const BASE_URL = (import.meta.env.VITE_BASE_URL as string) || '/energy/ems-api';
/**
 * 网关配置
 */
const gateWayConfig: {
  [key: string]: { BASE_URL: string; PUBLIC_PATH: string };
} = {
  development: {
    BASE_URL,
    PUBLIC_PATH: '/ems',
  },
  production: {
    BASE_URL,
    PUBLIC_PATH: '/energy/ems/ems-container',
  },
};

export default { ...gateWayConfig[env], TIME_OUT };
