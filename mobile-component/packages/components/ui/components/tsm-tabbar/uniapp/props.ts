/**
 * Tabbar 标签栏组件 Props 定义
 */
import type { CSSProperties } from 'vue';

export interface TabbarProps {
  /** 当前选中项的索引 */
  modelValue?: number;
  /** 是否固定在底部 */
  fixed?: boolean;
  /** 背景颜色 */
  bgColor?: 'default' | 'capsule';
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  modelValue: 1,
  fixed: true,
  bgColor: 'default',
  customClass: '',
  customStyle: () => ({}),
} as const;
