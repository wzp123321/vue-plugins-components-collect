/**
 * Button 按钮组件 Props 定义
 */
import type { CSSProperties } from 'vue';

// 操作类型
export enum StepperOperation {
  /** 增加 */
  Plus = 'plus',
  /** 减少 */
  Minus = 'minus',
}

export interface StepperProps {
  /** 组件定值，用于双向绑定 */
  modelValue?: string | number;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否为小尺寸组件 */
  small?: boolean;
  /** 步长，每次加或减的值， 支持小数值，如需小数 */
  step?: string | number;
  /** 最小值 */
  min?: string | number;
  /** 最大值 */
  max?: string | number;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  modelValue: 0,
  disabled: false,
  small: false,
  step: 1,
  min: 0,
  max: 9999, // Number.MAX_SAFE_INTEGER,
  customClass: '',
  customStyle: () => ({}),
} as const;
