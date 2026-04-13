/**
 * IndexAnchor 索引锚点组件 Props 定义
 * @description 简化版索引锚点组件
 */
import type { CSSProperties } from 'vue';

export interface IndexAnchorProps {
  /** 锚点索引 */
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
