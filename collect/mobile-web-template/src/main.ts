import { createApp } from 'vue';
import App from './App.vue';
import { setupPlugins } from './plugins';
import { setupStore } from './store';
import { setupRouter } from './router';

const app = createApp(App);

// 安装插件（vant-ui等）,若使用了 vite-plugin-components 插件，则需要手动引入组件
setupPlugins(app);
// 安装vuex
setupStore(app);
// 安装router
setupRouter(app);

app.mount('#app');
