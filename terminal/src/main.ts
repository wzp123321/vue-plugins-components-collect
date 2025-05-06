import { createApp } from 'vue';
import router from './router';
import './assets/css/index.less';
import App from './app.vue';

const app = createApp(App);

app.use(router).mount('#app');
