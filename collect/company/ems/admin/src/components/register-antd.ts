import { Menu } from 'ant-design-vue';
import { App } from 'vue';
import 'ant-design-vue/lib/menu/style/index.css';
const registerAntdV = (app: App) => {
    app.use(Menu);
}

export default registerAntdV;
