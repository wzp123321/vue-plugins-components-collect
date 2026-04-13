/**
 * Slider 滑块组件 Props 定义
 * @description 简化版滑块组件，用于选择数值范围
 */
import type { CSSProperties } from 'vue';

export interface SliderProps {
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
  /** 滑块大小 */
  blockSize?: number;
  /** 滑块颜色 */
  activeColor?: string;
  /** 背景颜色 */
  inactiveColor?: string;
  /** 进度条颜色 */
  blockColor?: string;
  /** 是否显示当前值 */
  showValue?: boolean;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  value: 0,
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
  blockSize: 20,
  activeColor: '#2979ff',
  inactiveColor: '#ebedf0',
  blockColor: '#ffffff',
  showValue: false,
  customClass: '',
  customStyle: () => ({}),
} as const;
