/**
 * BreadCrumb 面包屑组件 Props 定义
 */
import type { CSSProperties } from 'vue';

export enum BreadcrumbEllipsisMode {
  Middle = 'middle',
  End = 'end',
}
export enum BreadcrumbOverflowMode {
  Scroll = 'scroll',
  Wrap = 'wrap',
}

export interface BreadcrumbItem {
  /** 默认展示文本（可通过 itemTextKey 覆盖） */
  name?: string | number;
  /** 扩展字段 */
  [key: string]: unknown;
}

export interface BreadCrumbProps {
  /** 面包屑数据 */
  items?: BreadcrumbItem[];
  /** 面包屑文本字段名 */
  itemTextKey?: string;
  /** 文本超长省略方式：中间省略或末尾省略 */
  ellipsisMode?: BreadcrumbEllipsisMode.Middle | BreadcrumbEllipsisMode.End;
  /** 内容超出可视区处理方式：横向滚动或折叠换行 */
  overflowMode?: BreadcrumbOverflowMode.Scroll | BreadcrumbOverflowMode.Wrap;
  /** 是否显示单项前置图标 */
  showItemIcon?: boolean;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  items: () => [],
  itemTextKey: 'name',
  ellipsisMode: 'end',
  overflowMode: 'scroll',
  showItemIcon: true,
  customClass: '',
  customStyle: () => ({}),
};
