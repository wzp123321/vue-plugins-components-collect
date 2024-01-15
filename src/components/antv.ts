/*
 * @Author: wanzp
 * @Date: 2023-08-13 21:18:29
 * @LastEditors: wzp123321 wanzhipengx@163.com
 * @LastEditTime: 2023-12-14 21:57:46
 * @Description:
 */
import { Menu, MenuItem, SubMenu, TabPane, Tabs, Divider } from 'ant-design-vue';
import { App } from 'vue';
import CommonCard from './common-card/common-card.vue';

const components = [Menu, MenuItem, SubMenu, TabPane, Tabs, Divider, CommonCard];

const registerAntv = (app: App) => {
  components.forEach((c) => {
    app.component(c.name, c);
  });
};

export default registerAntv;
