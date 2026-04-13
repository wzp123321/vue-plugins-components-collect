/**
 * NumberBox 数字输入框组件 Props 定义
 * @description 简化版数字输入框组件
 */
import type { CSSProperties } from 'vue';

export interface NumberBoxProps {
  /** 当前值 */
  value?: number;
  /** 最小值 */
  min?: number;
  /** 最大值 */
  max?: number;
  /** 步长 */
  step?: number;
  /** 是否禁用 */
  disabled?: boolean;
  /** 输入框宽度 */
  inputWidth?: number | string;
  /** 按钮大小 */
  buttonSize?: number | string;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  value: 0,
  min: 0,
  max: 999,
  step: 1,
  disabled: false,
  inputWidth: 40,
  buttonSize: 28,
  customClass: '',
  customStyle: () => ({}),
} as const;
