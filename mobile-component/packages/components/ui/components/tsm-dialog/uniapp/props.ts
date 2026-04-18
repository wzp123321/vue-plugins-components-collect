/**
 * Dialog 对话框组件 Props 定义
 * @description 简化版对话框组件，用于消息提示、确认等
 */
import type { CSSProperties } from 'vue';

export interface DialogProps {
  /** 是否显示对话框 */
  visible?: boolean;
  /** 类型 default | success | danger | warning | customize */
  type?: 'default' | 'success' | 'danger' | 'warning' | 'customize';
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
  /** 是否允许点击遮罩关闭 */
  closeOnClickOverlay?: boolean;
  /** 弹窗动画时间 */
  duration?: number;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  visible: false,
  type: 'default' as DialogType,
  title: '',
  content: '',
  confirmText: '确认',
  cancelText: '取消',
  showConfirmButton: true,
  showCancelButton: true,
  closeOnClickOverlay: false,
  duration: 400,
  customClass: '',
  customStyle: () => ({}),
} as const;
