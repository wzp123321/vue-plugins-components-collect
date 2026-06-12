/**
 * RadioGroup 单选框组组件 Props 定义
 */
import type { CSSProperties } from 'vue';

export interface RadioGroupProps {
  /** 当前选中的值 */
  value?: string;
  /** 是否为竖直排列 */
  vertical?: boolean;
  /** 是否禁用所有单选框 */
  disabled?: boolean;
  /** 是否只读 */
  readonly?: boolean;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  value: '',
  vertical: false,
  disabled: false,
  readonly: false,
  customClass: '',
  customStyle: () => ({}),
} as const;
