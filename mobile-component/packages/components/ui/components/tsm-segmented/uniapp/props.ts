/**
 * Segmented 分段器组件 Props 定义
 * @description 简化版分段器组件
 */
import type { CSSProperties } from 'vue';

export interface SegmentedProps {
  /** 选项列表 */
  list?: any[];
  /** 当前选中项索引 */
  value?: number;
  /** 选中颜色 */
  activeColor?: string;
  /** 未选中颜色 */
  inactiveColor?: string;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  list: () => [],
  value: 0,
  activeColor: '#2979ff',
  inactiveColor: '#f5f7fa',
  customClass: '',
  customStyle: () => ({}),
} as const;
