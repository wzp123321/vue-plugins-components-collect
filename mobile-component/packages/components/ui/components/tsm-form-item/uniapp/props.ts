/**
 * FormItem 表单项组件 Props 定义
 * @description 简化版表单项组件
 */
import type { CSSProperties } from 'vue';

export interface FormItemProps {
  /** 标签文字 */
  label?: string;
  /** 标签宽度 */
  labelWidth?: number | string;
  /** 是否必填 */
  required?: boolean;
  /** 错误信息 */
  error?: string;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  label: '',
  labelWidth: '80px',
  required: false,
  error: '',
  customClass: '',
  customStyle: () => ({}),
} as const;
