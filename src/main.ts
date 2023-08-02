/*
 * @Author: wanzp
 * @Date: 2022-07-11 19:35:59
 * @LastEditors: wanzp
<<<<<<< HEAD
 * @LastEditTime: 2023-07-04 14:02:13
=======
 * @LastEditTime: 2023-06-25 20:51:43
>>>>>>> 738aa385f13ae593329e3f8d1c8a58b1bcb79ebf
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

import './assets/test-color.js'

// import registerInputFilter from './directives/directive-filter/directive-filter';
// import dragDirectiveRegister from './directives/directive-drag/directive-drag';
import registerInputFilter from './directives/inputFilter';

const app = createApp(App);

app.use(createPinia()).use(registerInputFilter).use(router).mount('#app');
