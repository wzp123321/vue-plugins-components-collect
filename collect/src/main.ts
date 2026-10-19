import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import router from './router/index';

// vxe-table v4 依赖 vxe-pc-ui，须按官方方式先装 UI 再装表格
import VxeUIAll from 'vxe-pc-ui';
import 'vxe-pc-ui/es/style.css';
import VxeUITable from 'vxe-table';
import 'vxe-table/es/style.css';

import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import './assets/css/common.less';
import './assets/style/global.less';
import './assets/style/dark-theme.css';
import './assets/style/ai-theme.less';
import './assets/test-color.js';

import { registerDirectives } from './directives';
import registerAntv from './components/index';

const app = createApp(App);
registerAntv(app);
registerDirectives(app);

app.use(VxeUIAll).use(VxeUITable);
app.use(createPinia()).use(router).mount('#app');
