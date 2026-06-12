/**
 * ActionSheet 操作菜单组件 Props 定义
 */
import type { Component } from 'vue';

export interface SidebarMenuItem {
  /** 菜单文本 */
  label?: string;
  /** 图标（URL 或 icon name / emoji） */
  icon?: string | Component;
  /** 描述文字 */
  disabled?: boolean;
  [key: string]: any;
}

export interface SidebarProps {
  /** 是否显示 */
  menus: SidebarMenuItem[];
  badge: {
    isDot: boolean;
    prop: string;
  };
}

export const defaultProps = {
  menus: () => [],
  badge: () => null,
} as const;

/**
 * 图标尺寸
 */
export const iconSize = 18;
