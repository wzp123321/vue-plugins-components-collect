/**
 * BreadCrumbItem 面包屑项组件 Props 定义
 */
import type { Component } from 'vue';
export interface BreadcrumbItem {
  /** 默认展示文本 */
  name?: string | number;
  /** 扩展字段 */
  [key: string]: unknown;
}

export interface BreadCrumbItemProps {
  /** 单项数据 */
  item?: BreadcrumbItem;
  /** 文本内容 */
  label?: string;
  /** 文本超长省略方式：中间省略或末尾省略 */
  ellipsisMode?: 'middle' | 'end';
  /** 是否显示单项前置图标 */
  showItemIcon?: boolean;
}

export const defaultProps = {
  item: () => ({}),
  label: '',
  ellipsisMode: 'end',
  showItemIcon: true,
} as const;

/**
 * 图标尺寸
 */
export const iconSize = 16;

/**
 * 分隔符尺寸
 */
export const separatorSize = 14;

/**
 * 图标颜色，使用 CSS 变量动态控制
 */
export const itemIconColor = 'var(--tsm-breadcrumb-item-icon-color, var(--tsm-color-text-secondary))';
