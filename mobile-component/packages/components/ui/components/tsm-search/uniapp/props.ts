/**
 * Search 搜索组件 Props 定义
 * @description 简化版搜索组件
 */
import type { CSSProperties } from 'vue';

export interface SearchProps {
  /** 搜索框值 */
  value?: string;
  /** 占位符 */
  placeholder?: string;
  /** 是否显示清除按钮 */
  clearable?: boolean;
  /** 是否显示搜索按钮 */
  showAction?: boolean;
  /** 搜索按钮文字 */
  actionText?: string;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  value: '',
  placeholder: '请输入搜索关键词',
  clearable: true,
  showAction: true,
  actionText: '搜索',
  customClass: '',
  customStyle: () => ({}),
} as const;
