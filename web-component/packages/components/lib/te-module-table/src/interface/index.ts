/*
 * @Author: yanghui yanghui@tiansu-china.com
 * @Date: 2024-04-19 09:31:18
 * @LastEditors: yanghui yanghui@tiansu-china.com
 * @LastEditTime: 2024-04-19 09:46:13
 * @Description:
 */
import { VNode } from 'vue';
import { TableColumnCtx } from '@tiansu/element-plus/es/components/table/src/table-column/defaults';

export type RenderScope<T> = {
  row: T;
  $index: number;
  column: TableColumnCtx<T>;
  [key: string]: any;
};

export type filterListType = {
  id: number | string;
  name: string;
  checked?: boolean;
};

export type HeaderRenderScope<T> = {
  $index: number;
  column: ColumnProps<T>;
  [key: string]: any;
};

// 定义tdFormat函数类型
type TdFormatFunction<T> = (scope: T) => any;

export interface ColumnProps<T = any>
  extends Partial<
    Omit<TableColumnCtx<T>, 'children' | 'renderCell' | 'renderHeader'>
  > {
  headerRender?: (scope: HeaderRenderScope<T>) => VNode; // 自定义表头内容渲染（tsx语法）
  render?: (scope: RenderScope<T>) => VNode | string; // 自定义单元格内容渲染（tsx语法）
  _children?: ColumnProps<T>[]; // TODO多级表头
  checked: boolean; // 该列是否显示在表格中
  disabled?: boolean; // 该列是否可以配置是否显示
  prop: string;
  label: string;
  minStrNum?: number; // 展示最少字符数
  filterList?: filterListType[]; // 该列的筛选项,
  propFormat?: TdFormatFunction<T>; // tdFormat函数类型
  filterProp?: string;
}
