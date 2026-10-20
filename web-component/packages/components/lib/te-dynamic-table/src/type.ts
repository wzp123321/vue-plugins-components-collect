/*
 * @Author: 钱胜华 qiansh@tiansu-china.com
 * @Date: 2024-02-01 09:43:13
 * @LastEditors: 钱胜华 qiansh@tiansu-china.com
 * @LastEditTime: 2024-03-21 11:20:55
 * @FilePath: \nts-eam-front\src\components\te-dynamic-table\type.ts
 * @Description: 编辑表格类型定义
 */

import { TableColumnCtx } from "@tiansu/element-plus/es/components/table/src/table-column/defaults";
import type { FormRules } from "@tiansu/element-plus";

// 常用的输入类型
export enum EditType {
  INPUT = "input",
  INPUT_NUMBER = "inputNumber",
  SELECT = "select",
  DATA_PICKER = "datePicker",
  SLOT = "slot",
}

export type RenderScope<T> = {
  row: T;
  $index: number;
  column: TableColumnCtx<T>;
  [key: string]: any;
};
interface ElementAttrs {
  // 提示语
  placeholder?: string;
  // 下拉框是否多选
  mutilple?: boolean;
  // 透传组件的属性
  [prop: string]: any;
}
export interface Columns {
  key?: string | number;
  // 类型
  type: `${EditType}`;
  // 显示的标题
  label: string;
  // 表格列的属性
  prop: string;
  // 下拉框的数据源
  dataSource?: Array<{ id?: string | number; label: string; value: string }>;
  // tableColumn属性
  columnAttrs?: {
    [prop: string]: any;
  };
  // 组件属性
  elementAttrs?: ElementAttrs;
  // 表单校验规则
  rules?: FormRules[];
  listeners?: any;
}

// 表格模式：预览、编辑
export enum MODE {
  PREVIEW = "preview",
  EDIT = "edit",
}

// 表格大小：大号、中号
export enum TABLE_SIZE {
  LARGE = "large",
  DEFAULT = "default",
  SMALL = "small",
}

export interface DynamicTableProps {
  modelValue: Array<any>;
  // 表格列属性
  columns: Array<Columns>;
  // 使用模式，编辑和预览
  mode?: `${MODE}`;
  // 表格尺寸
  tableSize?: `${TABLE_SIZE}`;
  // 可添加的最大数量
  maxCount?: number;
  // 表格是否必填，表格必填时将会默认保留一行不可删除
  required?: boolean;
  // 是否展示序号列
  showIndex?: boolean;
  // 是否开启行拖拽排序
  showDragRow?: boolean;
  // 添加和删除内部已经封装了默认行为，如需覆盖，可直接从props传入方法覆盖默认行为
  handleAdd?: () => void;
  handleDelete?: (scope) => void;
}

