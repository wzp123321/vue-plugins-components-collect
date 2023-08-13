/*
 * @Author: wanzp
 * @Date: 2023-08-13 21:18:29
 * @LastEditors: wanzp
 * @LastEditTime: 2023-08-13 21:22:58
 * @Description:
 */
import { Menu, MenuItem, SubMenu, TabPane, Tabs, Divider } from 'ant-design-vue';
import { App } from 'vue';

const components = [Menu, MenuItem, SubMenu, TabPane, Tabs, Divider];

const registerAntv = (app: App) => {
  components.forEach((c) => {
    app.component(c.name, c);
  });
};

export default registerAntv;
