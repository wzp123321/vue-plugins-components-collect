/**
 * Form 表单组件 Props 定义
 * @description 简化版表单组件
 */
import type { CSSProperties } from 'vue';

export interface FormProps {
  /** 表单数据 */
  model?: Record<string, any>;
  /** 表单验证规则 */
  rules?: Record<string, any>;
  /** 是否显示错误信息 */
  showError?: boolean;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  model: () => ({}),
  rules: () => ({}),
  showError: true,
  customClass: '',
  customStyle: () => ({}),
} as const;
