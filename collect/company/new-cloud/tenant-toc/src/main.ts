/*
 * @Author: yut
 * @Date: 2023-08-09 09:33:46
 * @LastEditors: yut
 * @LastEditTime: 2023-08-09 17:41:33
 * @Descripttion:
 */
import { createApp } from 'vue';
import App from './app.vue';
import router from './router';
import store from './store';
/**
 * 自动注入
 */
import registerElementPlus from '@/components/register-elementplus';
import { globalRegisterTiansuElementPlus } from '@/components/register-tiansu';
import { registerAntd } from '@/components/register-antdv';
import { registerDirective } from './directives/index';
// 引入样式
import 'element-plus/dist/index.css';
import 'vxe-table/lib/style.css';
import '@tiansu/ts-web-package/dist/styles/index.css';
import '@/assets/css/common.less';
// 全局注册vxe-table组件
import VXETable from 'vxe-table';

/**
 * 路由钩子函数
 */
router.beforeEach(async (to, from, next) => {
  window.IS_PRODUCTION = process.env.NODE_ENV === 'production';

  if (to && to.meta) {
    document.title = to.meta.name ? String(to.meta.name) : '租户管理系统';
  }

  next();
});

function useTable(app: any) {
  app.use(VXETable);
}

const app = createApp(App);

registerAntd(app);
globalRegisterTiansuElementPlus(app);
registerDirective(app);

app.use(store).use(router).use(useTable).use(registerElementPlus).mount('#app');
