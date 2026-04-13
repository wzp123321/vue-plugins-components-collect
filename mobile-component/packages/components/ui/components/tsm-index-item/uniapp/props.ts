/**
 * IndexItem 索引列表项组件 Props 定义
 * @description 简化版索引列表项组件
 */
import type { CSSProperties } from 'vue';

export interface IndexItemProps {
  /** 索引值 */
  index?: string;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  index: '',
  customClass: '',
  customStyle: () => ({}),
} as const;
