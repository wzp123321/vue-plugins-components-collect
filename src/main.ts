/*
 * @Author: wanzp
 * @Date: 2022-07-11 19:35:59
 * @LastEditors: wanzp
 * @LastEditTime: 2023-04-18 22:01:50
 * @Description:
 */
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

import registerInputFilter from './directives/directive-filter/directive-filter';
import dragDirectiveRegister from './directives/directive-drag/directive-drag';

const app = createApp(App);

app.use(createPinia()).use(registerInputFilter).use(dragDirectiveRegister).use(router).mount('#app');
