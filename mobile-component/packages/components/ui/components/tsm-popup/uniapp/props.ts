/**
 * Popup 弹窗组件 Props 定义
 * @description 简化版弹窗组件，保留基础功能
 */
import type { CSSProperties } from 'vue';

export interface PopupProps {
  /** 是否显示弹窗 */
  show: boolean;
  /** 弹窗标题 */
  title?: string;
  /** 是否显示遮罩 */
  overlay?: boolean;
  /** 弹出方向: top | bottom | left | right | center */
  mode?: 'top' | 'bottom' | 'left' | 'right';
  /** 是否显示关闭图标 */
  closeable?: boolean;
  /** 点击遮罩是否关闭弹窗 */
  closeOnClickOverlay?: boolean;
  /** 层级 */
  zIndex?: number;
  /** 圆角值 */
  round?: number;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  show: false,
  overlay: true,
  mode: 'bottom',
  closeable: false,
  closeOnClickOverlay: true,
  zIndex: 10075,
  round: 10,
  customClass: '',
  customStyle: () => ({}),
} as const;
