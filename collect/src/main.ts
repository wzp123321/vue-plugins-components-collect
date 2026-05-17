import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import router from './router/index';

import 'element-plus/dist/index.css';
import './assets/css/common.less';
import './assets/style/global.less';
import './assets/test-color.js';

import { registerDirectives } from './directives';
import registerAntv from './components/index';

const app = createApp(App);
registerAntv(app);
registerDirectives(app);

app.use(createPinia()).use(router).mount('#app');
