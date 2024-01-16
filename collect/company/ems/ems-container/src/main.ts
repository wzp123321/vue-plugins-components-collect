import { createApp } from 'vue';
import App from './app.vue';
import store from './store/index';
import router from './router/index';

import './assets/style/index.less';
import 'element-plus/dist/index.css';
import 'ant-design-vue/es/menu/style/css';
import { ElLoading } from 'element-plus';

import { FSetSessionStorageData } from './utils/index';
// 注册图标组件
import { registerIconBox } from './core/index';

// 创建全局应用
const app = createApp(App);

router.beforeEach(async (to, from, next) => {
  if (to && to.meta) {
    document.title = '能源管理系统';
  }

  window.IS_PRODUCTION = import.meta.env?.VITE_NODE_ENV !== 'development';

  /**
   * 开发使用
   * 如果要直接使用tenantCode需要清除cookie 地址栏参数改为tenantCode=xx&loginName=yyy，并注释下面代码
   */
  if (!window.IS_PRODUCTION) {
    FSetSessionStorageData(
      'energy-token',
      'f6e836f2e09743a39d24720522738727e46646272beff82dac0492342f0edf411691716011840',
    );
    FSetSessionStorageData('energy-corpid', '888');
  }

  next();
});

registerIconBox(app);
app.use(store).use(router).use(ElLoading).mount('#app');
