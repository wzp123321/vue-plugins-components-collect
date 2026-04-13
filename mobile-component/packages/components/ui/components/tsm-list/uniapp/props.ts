/**
 * List 列表组件 Props 定义
 * @description 简化版列表组件
 */
import type { CSSProperties } from 'vue';

export interface ListProps {
  /** 是否加载中 */
  loading?: boolean;
  /** 是否加载完成 */
  finished?: boolean;
  /** 加载完成文字 */
  finishedText?: string;
  /** 加载失败文字 */
  errorText?: string;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  loading: false,
  finished: false,
  finishedText: '没有更多了',
  errorText: '加载失败，点击重试',
  customClass: '',
  customStyle: () => ({}),
} as const;
