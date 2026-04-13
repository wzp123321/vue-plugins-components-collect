/**
 * Dialog 对话框组件 Props 定义
 * @description 简化版对话框组件，用于消息提示、确认等
 */
import type { CSSProperties } from 'vue';

export interface DialogProps {
  /** 是否显示对话框 */
  show?: boolean;
  /** 标题内容 */
  title?: string;
  /** 对话框内容 */
  content?: string;
  /** 确认按钮文字 */
  confirmText?: string;
  /** 取消按钮文字 */
  cancelText?: string;
  /** 是否显示确认按钮 */
  showConfirmButton?: boolean;
  /** 是否显示取消按钮 */
  showCancelButton?: boolean;
  /** 确认按钮颜色 */
  confirmColor?: string;
  /** 取消按钮颜色 */
  cancelColor?: string;
  /** 是否对调确认和取消按钮位置 */
  buttonReverse?: boolean;
  /** 是否开启缩放模式 */
  zoom?: boolean;
  /** 是否异步关闭 */
  asyncClose?: boolean;
  /** 是否允许点击遮罩关闭 */
  closeOnClickOverlay?: boolean;
  /** 对话框宽度 */
  width?: string | number;
  /** 弹窗动画时间 */
  duration?: number;
  /** 内容文字对齐方式 */
  contentTextAlign?: 'left' | 'center' | 'right';
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  show: false,
  title: '',
  content: '',
  confirmText: '确认',
  cancelText: '取消',
  showConfirmButton: true,
  showCancelButton: false,
  confirmColor: '#2979ff',
  cancelColor: '#606266',
  buttonReverse: false,
  zoom: true,
  asyncClose: false,
  closeOnClickOverlay: false,
  width: '650rpx',
  duration: 400,
  contentTextAlign: 'left',
  customClass: '',
  customStyle: () => ({}),
} as const;
