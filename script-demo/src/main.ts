import { createApp, App as AppInstance } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import App from './App.vue';
import '@tiansu/hlms-portal-web-package/dist/style.css';
import '@/styles/index.scss';
import '@tiansu/ts-web-package/dist/styles/index.css';
import {
  renderWithQiankun,
  qiankunWindow,
  QiankunProps,
} from 'vite-plugin-qiankun/dist/helper';
import { piniaPluginInitLoginInfo } from '@/store/plugins';

let microApp: AppInstance;
const render = (props: QiankunProps = {}) => {
  const { container } = props;
  const pinia = createPinia();
  pinia.use(piniaPluginPersistedstate);
  pinia.use(piniaPluginInitLoginInfo);
  debugger;
  microApp = createApp(App);
  microApp.mount(container ? container.querySelector('#app') : '#app');
};

/**
 * 初始化为微前端子应用
 */
const initQianKun = () => {
  renderWithQiankun({
    mount(props) {
      console.log('vue3sub mount', props);
      render(props);
    },
    bootstrap() {
      console.log('bootstrap');
    },
    unmount(props: any) {
      console.log('vue3sub unmount', props);
      microApp.unmount();
    },
    update(props: any) {
      console.log('vue3sub update');
      console.log(props);
    },
  });
};
// 判断是不是微前端环境，执行不同的初始化
// eslint-disable-next-line no-underscore-dangle
if (qiankunWindow.__POWERED_BY_QIANKUN__) {
  initQianKun();
} else {
  render();
}
