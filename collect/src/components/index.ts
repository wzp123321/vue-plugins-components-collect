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

/**
 * 全局组件注册
 *
 * 注意：element-plus 已由 vite 的 ElementPlusResolver 按需自动导入，
 * 这里的 ElButton/ElInput 等手工注册是历史遗留（保证模板里不写 import 也能用）。
 * 新增自有组件时优先走 unplugin-vue-components 的目录扫描，而不是往这里堆。
 */
const registerGlobalComponents = (app: App) => {
  components.forEach((c) => {
    app.component(c.name!, c);
  });

  app.config.globalProperties.$message = ElMessage;
  app.config.globalProperties.$messageBox = ElMessageBox;
};

export default registerGlobalComponents;
