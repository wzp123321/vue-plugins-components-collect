/**
 * Image 图片组件 Props 定义
 * @description 简化版图片组件，支持淡入动画、加载中、加载失败提示等功能
 */
import type { CSSProperties } from 'vue';

export interface ImageProps {
  /** 图片地址 */
  src?: string;
  /** 裁剪模式 */
  mode?: string;
  /** 宽度 */
  width?: string | number;
  /** 高度 */
  height?: string | number;
  /** 图片形状 */
  shape?: 'circle' | 'square';
  /** 圆角值 */
  radius?: string | number;
  /** 是否懒加载 */
  lazyLoad?: boolean;
  /** 是否开启长按图片显示菜单 */
  showMenuByLongpress?: boolean;
  /** 是否显示加载中的图标 */
  showLoading?: boolean;
  /** 是否显示加载错误的图标 */
  showError?: boolean;
  /** 是否需要淡入效果 */
  fade?: boolean;
  /** 过渡时间，单位ms */
  duration?: number;
  /** 背景颜色 */
  bgColor?: string;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  src: '',
  mode: 'aspectFill',
  width: '300',
  height: '225',
  shape: 'square',
  radius: 0,
  lazyLoad: true,
  showMenuByLongpress: false,
  showLoading: true,
  showError: true,
  fade: true,
  duration: 500,
  bgColor: '#f3f4f6',
  customClass: '',
  customStyle: () => ({}),
} as const;
