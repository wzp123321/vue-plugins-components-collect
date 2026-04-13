/**
 * Empty 空状态组件 Props 定义
 */
import type { CSSProperties } from 'vue';

export interface EmptyProps {
  /** 图标名称 */
  icon?: string;
  /** 提示文字 */
  text?: string;
  /** 图标大小 */
  iconSize?: number | string;
  /** 文字颜色 */
  textColor?: string;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  icon: 'empty',
  text: '暂无数据',
  iconSize: 80,
  textColor: '#909399',
  customClass: '',
  customStyle: () => ({}),
} as const;
