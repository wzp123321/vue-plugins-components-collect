import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import router from './router/index';

import 'ant-design-vue/dist/antd.css';
import './assets/css/common.less';
import './assets/style/global.less';
import 'element-plus/dist/index.css';
import './assets/test-color.js';

import registerInputFilter from './directives/inputFilter';
import { registerAntv } from './components/index';

const app = createApp(App);
registerAntv(app);

app
  .use(createPinia())
  .use(registerInputFilter)
  .use(router)
  .mount('#app');
