/**
 * Input 输入框组件 Props 定义
 * @description 简化版输入框组件
 */
import type { CSSProperties } from 'vue';

export interface InputProps {
  /** 输入框的值 */
  value?: string;
  /** 输入框类型 */
  type?: 'text' | 'number' | 'idcard' | 'digit' | 'password' | 'tel';
  /** 占位符 */
  placeholder?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readonly?: boolean;
  /** 最大长度 */
  maxlength?: number;
  /** 是否显示清除按钮 */
  clearable?: boolean;
  /** 是否自动聚焦 */
  autofocus?: boolean;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  value: '',
  type: 'text',
  placeholder: '',
  disabled: false,
  readonly: false,
  maxlength: -1,
  clearable: false,
  autofocus: false,
  customClass: '',
  customStyle: () => ({}),
} as const;
