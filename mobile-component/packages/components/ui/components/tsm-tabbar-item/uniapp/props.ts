/**
 * TabbarItem 标签栏项组件 Props 定义
 */
import type { CSSProperties, Component } from 'vue';

export interface TabbarItemProps {
  /** 标签文字 */
  text?: string;
  /** 图标路径 */
  icon?: string | Component;
  /** 角标数量 */
  badge?: number;
  /** 角标类型 dot | circle */
  badgeType?: 'dot' | 'circle';
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  text: '',
  icon: undefined,
  badge: 0,
  badgeType: 'dot',
  customClass: '',
  customStyle: () => ({}),
} as const;
