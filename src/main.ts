import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import router from './router/index';

import 'ant-design-vue/dist/antd.css';
import './assets/css/common.less';
import './assets/style/global.less';
import 'element-plus/dist/index.css';
import 'jspreadsheet-ce/dist/jspreadsheet.css';
import 'jsuites/dist/jsuites.css';

import './assets/test-color.js';

import registerInputFilter from './directives/inputFilter';

const app = createApp(App);

app.use(createPinia()).use(registerInputFilter).use(router).mount('#app');
