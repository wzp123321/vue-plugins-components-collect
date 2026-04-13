/**
 * Tabbar 标签栏组件 Props 定义
 */
import type { CSSProperties } from 'vue';

export interface TabbarProps {
  /** 当前选中项的值 */
  value?: number | string;
  /** 是否固定在底部 */
  fixed?: boolean;
  /** 选中颜色 */
  activeColor?: string;
  /** 未选中颜色 */
  inactiveColor?: string;
  /** 背景颜色 */
  bgColor?: string;
  /** 是否显示顶部边框 */
  borderTop?: boolean;
  /** 是否为iPhoneX留出底部安全距离 */
  safeAreaInsetBottom?: boolean;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  value: 0,
  fixed: true,
  activeColor: '#2979ff',
  inactiveColor: '#909399',
  bgColor: '#ffffff',
  borderTop: true,
  safeAreaInsetBottom: true,
  customClass: '',
  customStyle: () => ({}),
} as const;
