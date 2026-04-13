import { createSSRApp } from 'vue';
import App from './App.vue';
import UI from '@/uni_modules/@tiansu/ts-mobile-ui/components/index';

export function createApp() {
  const app = createSSRApp(App);
  app.use(UI);
  return {
    app,
  };
}
