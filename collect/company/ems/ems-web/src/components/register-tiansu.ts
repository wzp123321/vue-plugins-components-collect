/*
 * @Author: yut
 * @Date: 2023-11-30 11:29:26
 * @LastEditors: yut
 * @LastEditTime: 2024-01-05 17:24:42
 * @Descripttion:
 */
/**
 * 全局注册组件库
 */
import { App } from 'vue';
import {
  TeButton,
  TeInput,
  TeSelect,
  TeOption,
  TeTabs,
  TeTabPane,
  TeTable,
  TeTableColumn,
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
  TeTooltip,
} from '@tiansu/element-plus';

const components = [
  TeButton,
  TeInput,
  TeSelect,
  TeOption,
  TeTabs,
  TeTabPane,
  TeTable,
  TeTableColumn,
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
  TeTooltip,
];

export const globalRegisterTiansuElementPlus = (app: App) => {
  components.forEach((c) => {
    app.component(c.name, c);
  });
};
