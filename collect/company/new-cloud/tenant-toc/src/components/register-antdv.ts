import { Menu } from 'ant-design-vue';
import 'ant-design-vue/lib/menu/style';
import { App } from 'vue';

export const registerAntd = (app: App) => {
  app.use(Menu);
};
