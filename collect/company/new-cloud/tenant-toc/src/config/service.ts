const TIME_OUT = 60 * 1000;

const getGateWayConfig = () => {
  const env = process.env.NODE_ENV || 'production';
  const gateWayConfig: { [key: string]: { WEBCORE_BASE_URL: string; BASE_URL: string; PUBLIC_PATH: string } } = {
    development: {
      WEBCORE_BASE_URL: 'energy-tenant-toc',
      BASE_URL: '/energy-tenant-toc',
      PUBLIC_PATH: '/',
    },
    production: {
      WEBCORE_BASE_URL: 'energy-tenant-toc',
      BASE_URL: '/energy-tenant-toc',
      PUBLIC_PATH: '/tenant-toc',
    },
  };
  return Object.assign(gateWayConfig[env], { TIME_OUT });
};

export default getGateWayConfig();
