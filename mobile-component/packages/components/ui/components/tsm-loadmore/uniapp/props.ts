/**
 * Loadmore 加载更多组件 Props 定义
 * @description 简化版加载更多组件
 */
import type { CSSProperties } from 'vue';

export interface LoadmoreProps {
  /** 加载状态 */
  status?: 'loadmore' | 'loading' | 'nomore';
  /** 加载更多文字 */
  loadmoreText?: string;
  /** 加载中文字 */
  loadingText?: string;
  /** 没有更多文字 */
  nomoreText?: string;
  /** 是否虚线 */
  isDot?: boolean;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  status: 'loadmore',
  loadmoreText: '加载更多',
  loadingText: '加载中...',
  nomoreText: '没有更多了',
  isDot: false,
  customClass: '',
  customStyle: () => ({}),
} as const;
