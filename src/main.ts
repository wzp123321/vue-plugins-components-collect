import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import router from './router/index';

import 'ant-design-vue/dist/antd.css';
import './assets/css/common.less';
import './assets/style/global.css';

import 'element-plus/dist/index.css';

const app = createApp(App);

app.use(createPinia()).use(router).mount('#app');
