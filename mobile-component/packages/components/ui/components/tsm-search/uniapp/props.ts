/**
 * Search 搜索组件 Props 定义
 * @description 简化版搜索组件
 */
import type { CSSProperties } from 'vue';

export interface SearchProps {
  /** 搜索框值 */
  modelValue?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 占位符 */
  placeholder?: string;
  /** 是否显示清除按钮 */
  clearable?: boolean;
  /** 触发search事件的延迟时间，单位ms，默认不延迟*/
  delay?: number;
  /** 搜索框形状，可选值为round或rectangle */
  shape?: 'round' | 'rectangle';
  /** 搜索框背景色模式，可选值为white或default */
  bgColor?: 'white' | 'default';
  /** 是否显示条件筛选按钮 */
  showFilterBtn?: boolean;
  /**  条件筛选按钮是否设置了条件 */
  filterBtnHasCondition?: boolean;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  modelValue: '',
  disabled: false,
  placeholder: '请输入搜索关键词',
  clearable: true,
  delay: 0,
  shape: 'rectangle',
  bgColor: 'default',
  showFilterBtn: false,
  filterBtnHasCondition: false,
  customClass: '',
  customStyle: () => ({}),
} as const;
