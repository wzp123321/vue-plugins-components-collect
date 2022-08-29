import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import router from './router/index';

import 'ant-design-vue/dist/antd.css';
import './assets/css/common.less';
import 'element-plus/dist/index.css';
import './assets/style/global.less';

const app = createApp(App);

app.use(createPinia()).use(router).mount('#app');
