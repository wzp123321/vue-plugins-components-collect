import { createApp } from 'vue';
import App from './app.vue';
import { Router } from 'vue-router';
import router from './router';
import store from './store';
import message from '@/utils/message';
import { AxiosInstance } from 'axios';

// 注入element-plus
import registerComponent from './components/index';

import 'element-plus/dist/index.css';
import './index.css';
import './assets/css/common.less';

const app = createApp(App);
//全局配置axios，router （typescript使用）
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $router: Router;
  }
}

const getQueryString = (name: string) => {
  const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
  const r = window.location.search.substr(1).match(reg);
  if (r != null) return decodeURI(r[2]);
  return null;
};
/**
 * 路由钩子函数
 * 1.处理第三方跳转过来携带的参数,进行加密处理
 * 2.处理主题配置
 * 3.字典
 * 4.项目类型 & 菜单
 */
router.beforeEach(async (to, from, next) => {
  if (to && to.meta) {
    document.title = to.meta.name ? String(to.meta.name) : '能源管理系统';
  }
  const keys = Object.keys(to.query);

  let params: GlobalModule.CommonObject = {};
  if (keys?.length) {
    keys.forEach((item) => {
      params = {
        ...params,
        [item]: getQueryString(item),
      };
    });
  }
  store.dispatch('setJumpParams', params);

  next();
});

registerComponent(app);
app.use(router).use(store).mount('#app');

app.config.globalProperties.$message = message;
