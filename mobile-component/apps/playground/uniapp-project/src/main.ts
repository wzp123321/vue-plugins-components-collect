import { createSSRApp } from 'vue';
import App from './App.vue';
import UI from '@/uni_modules/@zpackage/mobile-package/ui/components/index';
import BizUI from '@/uni_modules/@zpackage/mobile-package/biz-ui/components/index';
import { initThemeMode } from '@/uni_modules/@zpackage/mobile-package/token/index';

export function createApp() {
  const app = createSSRApp(App);
  app.use(UI);
  app.use(BizUI);
  initThemeMode();
  return {
    app,
  };
}
