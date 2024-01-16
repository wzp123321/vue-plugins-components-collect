import { createApp } from 'vue';
import App from './app.vue';
import router from './router';
import { TeLoading } from '@tiansu/element-plus';
import './services/interceptor/index';

// 公共&组件样式
import '@tiansu/element-plus/dist/index.css';
import './assets/less/te-element-plus-reset/index.less';
import './style.css';
// 全局组件
import globalComponentsInstall from './components/index';
// element-plus全局注册
import { registerElementPlus } from './components/element-plus-register';
// 公共过滤指令
import directiveRegister from './directives/index';

const app = createApp(App);
registerElementPlus(app);
directiveRegister.registerInputFilter(app);

app.use(router).use(globalComponentsInstall).use(TeLoading).mount('#app');
