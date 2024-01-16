// 环境打包地址配置
let baseURL = '';
switch (process.env.NODE_ENV) {
  case 'development':
    baseURL = '/energy/ems-api/'; //ch
    break;
  case 'testing': // 注意这里的名字要和步骤二中设置的环境名字对应起来
    baseURL = ''; // 这里是测试环境中的url
    break;
  case 'production':
    baseURL = '/energy/ems-api/'; //ch
    break;
}

export { baseURL };
