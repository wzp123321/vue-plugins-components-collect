import { createSSRApp } from 'vue';
import App from './App.vue';
import UI from '@/uni_modules/@tiansu/ts-mobile-ui/components/index';
import BizUI from '@/uni_modules/@tiansu/ts-mobile-biz-ui/components/index';
import { initThemeMode } from '@/uni_modules/@tiansu/ts-mobile-token/index';

export function createApp() {
  const app = createSSRApp(App);
  app.use(UI);
  app.use(BizUI);
  initThemeMode();
  return {
    app,
  };
}
