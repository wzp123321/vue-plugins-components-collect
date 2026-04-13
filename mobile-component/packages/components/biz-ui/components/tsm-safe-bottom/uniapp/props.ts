/**
 * SafeBottom 安全区域组件 Props 定义
 * @description 简化版安全区域组件
 */
import type { CSSProperties } from 'vue';

export interface SafeBottomProps {
  /** 背景颜色 */
  bgColor?: string;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  bgColor: '#ffffff',
  customClass: '',
  customStyle: () => ({}),
} as const;
