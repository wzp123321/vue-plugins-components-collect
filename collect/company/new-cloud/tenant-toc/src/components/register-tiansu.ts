/**
 * 全局注册组件库
 */
import { App } from 'vue';
import {
  TeDrawer,
  TeButton,
  TeInput,
  TeSelect,
  TeOption,
  TeTabs,
  TeTabPane,
  TeRadio,
  TeRadioGroup,
  TeRadioButton,
  TeDropdown,
  TeDropdownMenu,
  TeDropdownItem,
  TeCheckboxGroup,
  TeCheckbox,
  TeForm,
  TeFormItem,
  TeScrollbar,
  TeTable,
  TeTableColumn,
  TeSelectV2,
  TeTooltip,
  TeDatePicker,
  TePopconfirm,
  TePopover,
  TeCollapse,
  TeCollapseItem,
  TePagination,
  TeTableV2,
  TeDialog,
} from '@tiansu/element-plus';

const components = [
  TeDrawer,
  TeButton,
  TeInput,
  TeSelect,
  TeOption,
  TeTabs,
  TeTabPane,
  TeRadio,
  TeRadioGroup,
  TeRadioButton,
  TeDropdown,
  TeDropdownMenu,
  TeDropdownItem,
  TeCheckboxGroup,
  TeCheckbox,
  TeForm,
  TeFormItem,
  TeScrollbar,
  TeTable,
  TeTableColumn,
  TeSelectV2,
  TeTooltip,
  TeDatePicker,
  TePopconfirm,
  TePopover,
  TeCollapse,
  TeCollapseItem,
  TePagination,
  TeTableV2,
  TeDialog,
];

export const globalRegisterTiansuElementPlus = (app: App) => {
  components.forEach((c) => {
    app.component(c.name, c);
  });
};
