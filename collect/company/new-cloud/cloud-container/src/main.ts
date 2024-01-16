import { createApp } from 'vue';
import App from './app.vue';
import store from './store/index';
import router from './router/index';

// 导入全局样式
import './assets/style/index.less';
import '@tiansu/ts-web-package/dist/styles/index.css';

// 挂载全局拦截器
import './core/interceptor';

// 创建全局应用
const app = createApp(App);

app.use(store).use(router).mount('#app');
