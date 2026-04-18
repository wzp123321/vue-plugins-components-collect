/**
 * Input 输入框组件 Props 定义
 * @description 简化版输入框组件
 */
import type { CSSProperties } from 'vue';
export interface InputProps {
  /** 输入框的值 */
  modelValue: string;
  /**消费value，使uni内置的input组件的value属性失效 */
  value?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readonly?: boolean;
  /** 最大长度 */
  maxlength?: number;
  /** 是否显示清除按钮 */
  clearable?: boolean;
  /** 是否显示最大长度提示 */
  showWordimit?: boolean;
  /** 提示信息 */
  tips?: string;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  modelValue: '',
  value: '',
  disabled: false,
  readonly: false,
  maxlength: -1,
  clearable: false,
  showWordimit: false,
  tips: '',
  customClass: '',
  customStyle: () => ({}),
} as const;
