import { App } from 'vue';
import CommonCard from './common-card/common-card.vue';
import CommonPageContainer from './common-page-container/common-page-container.vue';

import {
  ElButton,
  ElInput,
  ElCheckbox,
  ElRadio,
  ElRadioGroup,
  ElRadioButton,
  ElTree,
  ElMenu,
  ElMenuItem,
  ElSubMenu,
  ElContainer,
  ElHeader,
  ElMain,
  ElMessage,
  ElMessageBox,
} from 'element-plus';

const components = [
  CommonCard,
  CommonPageContainer,
  ElButton,
  ElInput,
  ElCheckbox,
  ElRadio,
  ElRadioGroup,
  ElRadioButton,
  ElTree,
  ElMenu,
  ElMenuItem,
  ElSubMenu,
  ElContainer,
  ElHeader,
  ElMain,
];

const registerAntv = (app: App) => {
  components.forEach((c) => {
    app.component(c.name!, c);
  });

  app.config.globalProperties.$message = ElMessage;
  app.config.globalProperties.$messageBox = ElMessageBox;
};

export default registerAntv;
