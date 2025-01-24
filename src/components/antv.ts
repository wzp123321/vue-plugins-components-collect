/*
 * @Author: wanzp
 * @Date: 2023-08-13 21:18:29
 * @LastEditors: wanzp wanzp@tiansu-china.com
 * @LastEditTime: 2025-01-24 17:08:24
 * @Description:
 */
import {
  Menu,
  MenuItem,
  SubMenu,
  TabPane,
  Tabs,
  Divider,
  Button,
  Radio,
  Row,
  Col,
  Card,
  Switch,
  Input,
  RadioGroup,
  Textarea,
} from 'ant-design-vue';
import { App } from 'vue';
import CommonCard from './common-card/common-card.vue';

const components = [
  Menu,
  MenuItem,
  SubMenu,
  TabPane,
  Tabs,
  Divider,
  CommonCard,
  Button,
  Radio,
  Row,
  Col,
  Card,
  Switch,
  Input,
  RadioGroup,
  Textarea,
];

const registerAntv = (app: App) => {
  components.forEach((c) => {
    app.component(c.name, c);
  });
};

export default registerAntv;
