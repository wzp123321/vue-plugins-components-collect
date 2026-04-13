/**
 * Collapse 折叠面板组件 Props 定义
 * @description 简化版折叠面板组件
 */
import type { CSSProperties } from 'vue';

export interface CollapseProps {
  /** 当前展开的面板 */
  value?: string | number | (string | number)[];
  /** 是否手风琴模式 */
  accordion?: boolean;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  value: '',
  accordion: false,
  customClass: '',
  customStyle: () => ({}),
} as const;
