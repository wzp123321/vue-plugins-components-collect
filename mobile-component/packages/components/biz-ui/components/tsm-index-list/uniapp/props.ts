/**
 * IndexList 索引列表组件 Props 定义
 * @description 简化版索引列表组件
 */
import type { CSSProperties } from 'vue';

export interface IndexListProps {
  /** 当前选中的索引 */
  activeIndex?: string;
  /** 是否显示右侧索引栏 */
  showIndexBar?: boolean;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  activeIndex: '',
  showIndexBar: true,
  customClass: '',
  customStyle: () => ({}),
} as const;
