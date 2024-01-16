import {
  ElButton,
  ElInput,
  ElFooter,
  ElRadio,
  ElRadioGroup,
  ElHeader,
  ElIcon,
  ElAside,
  ElTree,
  ElPopover,
  ElTable,
  ElTableColumn,
  ElContainer,
  ElSelect,
  ElOption,
  ElForm,
  ElFormItem,
  ElMessage,
  ElMessageBox,
  ElLoading,
  ElNotification,
  ElInfiniteScroll,
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
  ElCheckbox,
  ElTimePicker,
  ElCascader,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElScrollbar,
  ElInputNumber,
  ElTabPane,
  ElTabs,
  ElUpload,
  ElCheckboxGroup,
  ElSwitch,
} from 'element-plus';
// 注册公共组件库
import {
  TeDrawer,
  TeForm,
  TeFormItem,
  TeButton,
  TeInput,
  TeDatePicker,
  TeSelect,
  TeOption,
  TeTag,
  TeTabs,
  TeTabPane,
  TeSelectV2,
  TePopover,
  TeDialog,
  TeCheckbox,
  TeCheckboxGroup,
  TeTree,
  TeTreeV2,
  TeDropdown,
  TeDropdownItem,
  TeDropdownMenu,
} from '@tiansu/element-plus';

import { App } from 'vue';
import 'element-plus/dist/index.css';
import message from '@/utils/message';
// 指令
import draggable from '../directive/draggable';
import registerInputFilter from '@/directive/input-filter';
import vAutoFocus from '../directive/auto-focus';
import vAutoBlur from '../directive/auto-blur';
import registerTestInputFilter from '@/directive/test-input-filter';
import VueGridLayout from 'vue-grid-layout';
// 组件
const components = [
  ElButton,
  ElInput,
  ElForm,
  ElFormItem,
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
  ElTimePicker,
  ElCascader,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElScrollbar,
  ElInputNumber,
  ElTabPane,
  ElTabs,
  ElUpload,
  ElCheckboxGroup,
  ElSwitch,

  TeDrawer,
  TeForm,
  TeFormItem,
  TeButton,
  TeInput,
  TeDatePicker,
  TeSelect,
  TeOption,
  TeTag,
  TeTabs,
  TeTabPane,
  TeSelectV2,
  TePopover,
  TeDialog,
  TeCheckbox,
  TeCheckboxGroup,
  TeTree,
  TeTreeV2,
  TeDropdown,
  TeDropdownItem,
  TeDropdownMenu,
];
// 插件
const plugins = [
  ElLoading,
  ElMessage,
  ElMessageBox,
  draggable,
  registerInputFilter,
  vAutoBlur,
  vAutoFocus,
  registerTestInputFilter,
];

const registerElementPlusUI = (app: App) => {
  components.forEach((item) => {
    app.component(item.name, item);
  });
  plugins.forEach((item) => {
    app.use(item);
  });
  app.use(VueGridLayout);
  /**
   * 解决message只能有一条的
   */
  let messageInstance: any;
  app.config.globalProperties.$message = message;
};

export default registerElementPlusUI;
