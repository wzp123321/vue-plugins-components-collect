/*
 * @Author: yut
 * @Date: 2023-11-28 15:30:11
 * @LastEditors: wanzp wanzp@tiansu-china.com
 * @LastEditTime: 2024-01-12 09:19:24
 * @Descripttion:
 */
import { createApp } from 'vue';
import App from './app.vue';
import router from './router';
import store from './store';
import * as emsConfig from './config/config';
import customComponents from './components';
// 注册element-plus组件
import registerElementPlus from './components/register-element-plus';
import { globalRegisterTiansuElementPlus } from '@/components/register-tiansu';
// 主题切换
import VueGridLayout from 'vue-grid-layout';
import { switchCustomTheme } from '@/utils/index';
import { FGetStorageData, FSetStorageData } from './utils/token';

// 引入公共样式
import './assets/less/common/common.less';
import '@tiansu/ts-web-package/dist/styles/index.css';

//虚拟列表
// vue virtual scroller
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'; // 引入它的 css
import VueVirtualScroller from 'vue-virtual-scroller'; // 引入它

/**
 * 路由钩子函数
 */
router.beforeEach(async (to, from, next) => {
  if (to && to.meta) {
    document.title = '能源管理系统';
  }

  window.IS_PRODUCTION = process.env?.NODE_ENV !== 'development';
  store.dispatch('setIsCloudEnvironment', !!FGetStorageData('ems-sourceValue'));

  /**
   * 开发使用
   * 如果要直接使用tenantCode需要清除cookie 地址栏参数改为tenantCode=xx&loginName=yyy，并注释下面代码
   */
  if (!window.IS_PRODUCTION) {
    FSetStorageData('energy-token', '3cfe08c05a864d2ea4a24db0a7cd92e3142e62a833f67eea4a1066e0f3eda2091704954903285');
    FSetStorageData('energy-corpid', '700');
    FSetStorageData('energy-loginName', 'admin');
    FSetStorageData('ems-wholeHospitalFlag', 'true');
  }
  if (!store.getters.themeOption || Object.keys(store.getters.themeOption).length === 0) {
    switchCustomTheme(store.getters.theme);
  }
  next();
});

const app = createApp(App);
app.config.globalProperties.$emsConfig = emsConfig;
registerElementPlus(app);
globalRegisterTiansuElementPlus(app);
app.use(VueVirtualScroller);
app.use(store);
app.use(router);
app.use(VueGridLayout);
app.use(customComponents);
app.mount('#app');
