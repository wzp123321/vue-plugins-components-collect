/**
 * Rate 评分组件 Props 定义
 * @description 简化版评分组件
 */
import type { CSSProperties } from 'vue';

export interface RateProps {
  /** 当前评分 */
  value?: number;
  /** 最大评分 */
  max?: number;
  /** 图标大小 */
  size?: number | string;
  /** 选中颜色 */
  activeColor?: string;
  /** 未选中颜色 */
  inactiveColor?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  value: 0,
  max: 5,
  size: 20,
  activeColor: '#ff9900',
  inactiveColor: '#c8c9cc',
  disabled: false,
  customClass: '',
  customStyle: () => ({}),
} as const;
