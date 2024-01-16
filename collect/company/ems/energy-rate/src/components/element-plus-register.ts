import { App } from 'vue';
import {
  TeButton,
  TeInput,
  TeDialog,
  TeSelect,
  TeOption,
  TeDatePicker,
  TeConfigProvider,
  TeDivider,
  TeRow,
  TeCol,
  TeTable,
  TeTableColumn,
  TeForm,
  TeFormItem,
  TePagination,
  TeTreeSelect,
} from '@tiansu/element-plus';

const components = [
  TeButton,
  TeInput,
  TeDialog,
  TeSelect,
  TeOption,
  TeDatePicker,
  TeConfigProvider,
  TeDivider,
  TeRow,
  TeCol,
  TeTable,
  TeTableColumn,
  TeForm,
  TeFormItem,
  TePagination,
  TeTreeSelect,
];
/**
 * 全局注册element-plus
 */
export const registerElementPlus = (app: App) => {
  components.forEach((item) => {
    app.component(item.name, item);
  });
};
