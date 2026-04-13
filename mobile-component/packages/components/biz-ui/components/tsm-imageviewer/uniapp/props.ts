/**
 * ImageViewer 图片预览组件 Props 定义
 * @description 简化版图片预览组件
 */
import type { CSSProperties } from 'vue';

export interface ImageViewerProps {
  /** 是否显示 */
  show?: boolean;
  /** 图片列表 */
  images?: string[];
  /** 当前图片索引 */
  initialIndex?: number;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  show: false,
  images: () => [],
  initialIndex: 0,
  customClass: '',
  customStyle: () => ({}),
} as const;
