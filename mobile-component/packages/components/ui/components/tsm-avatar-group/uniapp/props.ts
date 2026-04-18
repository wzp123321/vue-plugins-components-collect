/**
 * AvatarGroup 头像组组件 Props 定义
 */
import type { CSSProperties } from 'vue';

export interface AvatarGroupProps {
  /** 头像列表 */
  urls?: string[];
  /** 头像大小 */
  size?: 'xs' | 's' | 'm' | 'l' | 'xl';
  /** 最大显示数量 */
  maxCount?: number;
  /** 头像间距 */
  gap?: number;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  urls: () => [],
  size: 'm',
  maxCount: 5,
  customClass: '',
  customStyle: () => ({}),
} as const;
