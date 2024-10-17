/*
 * @Author: wanzp
 * @Date: 2023-08-13 21:18:29
 * @LastEditors: wanzp wanzp@tiansu-china.com
 * @LastEditTime: 2024-10-17 16:13:39
 * @Description:
 */
import { Menu, MenuItem, SubMenu, TabPane, Tabs, Divider, Button } from 'ant-design-vue';
import { App } from 'vue';
import CommonCard from './common-card/common-card.vue';

const components = [Menu, MenuItem, SubMenu, TabPane, Tabs, Divider, CommonCard, Button];

const registerAntv = (app: App) => {
  components.forEach((c) => {
    app.component(c.name, c);
  });
};

export default registerAntv;
