/*
 * @Author: yut
 * @Date: 2023-12-26 09:26:15
 * @LastEditors: wanzp wanzp@tiansu-china.com
 * @LastEditTime: 2024-01-15 09:14:43
 * @Descripttion:
 */
import { createApp } from 'vue';
import App from './app.vue';
import store from './store/index';
import router from './router/index';
// 注入element-plus
import registerComponent from './components/register';

//虚拟列表
// vue virtual scroller
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'; // 引入虚拟列表的 css
import VueVirtualScroller from 'vue-virtual-scroller'; // 引入虚拟列表
// 样式
import './assets/less/main.less';
import '../../style/global.css';
import './assets/less/reset-antdv.less';
import './assets/less/common-ui-reset.less';
import '@tiansu/ts-web-package/dist/styles/index.css';
// utils
import { FSetSessionStorageData } from '@/utils/token';
import CommonService from './services/common/common';

// 创建全局应用
const app = createApp(App);

// 钩子函数
router.beforeEach(async (to, from, next) => {
  window.IS_PRODUCTION = import.meta.env?.VITE_NODE_ENV !== 'development';

  // 开发使用
  if (!window.IS_PRODUCTION && !to.query?.token) {
    FSetSessionStorageData(
      'energy-token',
      '3cfe08c05a864d2ea4a24db0a7cd92e3142e62a833f67eea4a1066e0f3eda2091704954903285',
    );
    FSetSessionStorageData('energy-corpid', '700');
    FSetSessionStorageData('energy-loginName', 'admin');
  }

  document.title = to && to.meta && to.meta.name ? (to.meta.name as string) : '能源管理系统';
  if (to.path === '/forbidden' || to.path === '/admin/pConfigurationPage') {
    next();
    return;
  }

  // 获取服务器时间
  if (store.getters.diffTime === '') {
    try {
      const serverTime = await CommonService.getServerDate();
      const dTimeValue = String(serverTime.getTime() - new Date().getTime());
      store.dispatch('setDiffTime', dTimeValue);
    } catch (error) {
      store.dispatch('setDiffTime', '');
    }
  }

  next();
});

app.use(store).use(registerComponent).use(VueVirtualScroller).use(router).mount('#app');
