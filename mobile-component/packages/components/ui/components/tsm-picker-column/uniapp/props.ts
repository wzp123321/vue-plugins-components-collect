/**
 * PickerColumn 选择器列组件 Props 定义
 * @description 简化版选择器列组件
 */
import type { CSSProperties } from 'vue';

export interface PickerColumnProps {
  /** 选项列表 */
  values?: any[];
  /** 当前选中项索引 */
  valueIndex?: number;
  /** 选项显示字段 */
  keyName?: string;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  values: () => [],
  valueIndex: 0,
  keyName: 'text',
  customClass: '',
  customStyle: () => ({}),
} as const;
