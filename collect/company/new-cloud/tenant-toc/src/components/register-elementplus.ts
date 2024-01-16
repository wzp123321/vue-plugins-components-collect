import { App } from 'vue';
import {
  ElHeader,
  ElFooter,
  ElContainer,
  ElAside,
  ElMain,
  ElButton,
  ElInput,
  ElRadio,
  ElRadioGroup,
  ElIcon,
  ElTree,
  ElPopover,
  ElTable,
  ElTableColumn,
  ElSelect,
  ElOption,
  ElForm,
  ElFormItem,
  ElMessage,
  ElMessageBox,
  ElLoading,
  ElMenu,
  ElMenuItem,
  ElCol,
  ElRow,
  ElPopconfirm,
  ElPagination,
  ElDatePicker,
  ElDialog,
  ElTooltip,
  ElTag,
  ElConfigProvider,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElCheckbox,
  ElDivider,
  ElCollapse,
  ElCollapseItem,
  ElDrawer,
  ElDescriptions,
  ElDescriptionsItem,
  ElCard,
  ElTabs,
  ElTabPane,
  ElCheckboxGroup,
  ElCheckboxButton,
  ElUpload,
  ElImage,
} from 'element-plus';
// 引入全局组件
const files: any = require.context('./', true, /\.vue$/);

import message from '@/utils/message';

const components = [
  ElButton,
  ElInput,
  ElMain,
  ElForm,
  ElFormItem,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElRadio,
  ElRadioGroup,
  ElAside,
  ElIcon,
  ElFooter,
  ElHeader,
  ElContainer,
  ElMenu,
  ElMenuItem,
  ElTree,
  ElSelect,
  ElOption,
  ElTable,
  ElTableColumn,
  ElPopover,
  ElCol,
  ElRow,
  ElPopconfirm,
  ElPagination,
  ElDatePicker,
  ElDialog,
  ElTooltip,
  ElConfigProvider,
  ElTag,
  ElCheckbox,
  ElDivider,
  ElCollapse,
  ElCollapseItem,
  ElDrawer,
  ElDescriptions,
  ElDescriptionsItem,
  ElCard,
  ElTabs,
  ElCheckboxGroup,
  ElCheckboxButton,
  ElTabPane,
  ElUpload,
  ElImage,
];

const plugins = [ElMessage, ElMessageBox, ElLoading];

const registerElementPlus = (app: App<Element>) => {
  for (const item of components) {
    app.component(item.name, item);
  }
  for (const item of plugins) {
    app.use(item);
  }

  // 注册全局组件
  if (files && files.keys()) {
    files.keys().forEach((item: string) => {
      const reqComp = item.split('/');
      const componentName = reqComp[reqComp.length - 1].split('.')[0];
      app.component(componentName, files(item).default || files(item));
    });
  }
  /**
   * 解决message只能有一条的
   */
  app.config.globalProperties.$message = message;
};

export default registerElementPlus;
