/**
 * BackTop 返回顶部组件 Props 定义
 */
import type { CSSProperties } from 'vue';

export interface BackTopProps {
  /** 滚动距离 */
  scrollTop?: number;
  /** 触发距离 */
  top?: number;
  /** 图标名称 */
  icon?: string;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  scrollTop: 0,
  top: 400,
  icon: 'arrow-up',
  customClass: '',
  customStyle: () => ({}),
} as const;
