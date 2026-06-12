/**
 * Radio 单选框组件 Props 定义
 */
import type { CSSProperties } from 'vue';

export interface RadioProps {
  /** <radio> 标识。当该 <radio> 选中时，<radio-group> 的 change 事件会携带 <radio> 的 value */
  value?: string;
  /** 当前是否选中 */
  checked?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readonly?: boolean;
  /** 填充样式：fillCircle 填充圆形（默认），line 线条对号 */
  fillStyle?: 'fillCircle' | 'line';
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  value: '',
  checked: false,
  disabled: false,
  readonly: false,
  fillStyle: 'fillCircle',
  customClass: '',
  customStyle: () => ({}),
} as const;
