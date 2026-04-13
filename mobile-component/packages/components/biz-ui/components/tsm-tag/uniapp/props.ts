/**
 * Tag 标签组件 Props 定义
 * @description 简化版标签组件
 */
import type { CSSProperties } from 'vue';

export interface TagProps {
  /** 标签类型 */
  type?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  /** 标签大小 */
  size?: 'small' | 'medium' | 'large';
  /** 标签形状 */
  shape?: 'square' | 'circle' | 'mark';
  /** 标签文字 */
  text?: string;
  /** 背景颜色 */
  bgColor?: string;
  /** 文字颜色 */
  color?: string;
  /** 是否可关闭 */
  closable?: boolean;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  type: 'info',
  size: 'medium',
  shape: 'square',
  text: '',
  bgColor: '',
  color: '',
  closable: false,
  customClass: '',
  customStyle: () => ({}),
} as const;
