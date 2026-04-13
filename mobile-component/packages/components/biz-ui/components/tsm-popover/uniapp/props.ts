/**
 * Popover 弹出气泡组件 Props 定义
 * @description 简化版弹出气泡组件
 */
import type { CSSProperties } from 'vue';

export interface PopoverProps {
  /** 是否显示 */
  show?: boolean;
  /** 弹出位置 */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** 标题 */
  title?: string;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  show: false,
  placement: 'bottom',
  title: '',
  customClass: '',
  customStyle: () => ({}),
} as const;
