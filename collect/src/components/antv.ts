/*
 * @Author: wanzp
 * @Date: 2023-08-13 21:18:29
 * @LastEditors: wanzp wanzp@tiansu-china.com
 * @LastEditTime: 2025-02-21 15:29:25
 * @Description:
 */
import Antd from 'ant-design-vue';
import { App } from 'vue';
import CommonCard from './common-card/common-card.vue';
import CommonPageContainer from './common-page-container/common-page-container.vue';

const components = [CommonCard, CommonPageContainer];

const registerAntv = (app: App) => {
  app.use(Antd);
  components.forEach((c) => {
    app.component(c.name, c);
  });
};

export default registerAntv;
