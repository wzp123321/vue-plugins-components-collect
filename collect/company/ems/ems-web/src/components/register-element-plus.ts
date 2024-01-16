import {
  ElButton,
  ElInput,
  ElFooter,
  ElRadio,
  ElRadioButton,
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
  ElSubmenu,
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
  ElDivider,
  ElTimeline,
  ElTimelineItem,
  ElCarouselItem,
  ElCarousel,
} from 'element-plus';
import { App } from 'vue';
import 'element-plus/lib/theme-chalk/index.css';
// emmiter
const Emitter = require('tiny-emitter');
const emitter = new Emitter();
// drag
import IotDraggable from '@/components/directive/directive-draggable';
import InputFilter from '@/components/directive/directive-input-filter';
import message from '@/utils/message';

const components = [
  ElButton,
  ElInput,
  ElForm,
  ElFormItem,
  ElRadio,
  ElRadioButton,
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
  ElSubmenu,
  ElScrollbar,
  ElInputNumber,
  ElTabPane,
  ElTabs,
  ElUpload,
  ElCheckboxGroup,
  ElDivider,
  ElTimeline,
  ElTimelineItem,
  ElCarouselItem,
  ElCarousel,
];

const plugins = [
  ElMessage,
  ElMessageBox,
  ElInfiniteScroll,
  ElLoading,
  ElNotification,
  IotDraggable,
  InputFilter,
];

const registerElementPlus = (app: App<Element>) => {
  for (const item of components) {
    app.component(item.name, item);
  }
  for (const item of plugins) {
    app.use(item);
  }
  app.config.globalProperties.emitter = emitter;
  /**
   * 解决message只能有一条的
   */
  app.config.globalProperties.$message = message;
};

export default registerElementPlus;
