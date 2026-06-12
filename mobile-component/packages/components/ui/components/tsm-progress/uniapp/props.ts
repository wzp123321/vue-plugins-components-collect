/**
 * Progress 进度条组件 Props 定义
 * @description 进度条组件，用于显示进度
 */
import type { CSSProperties } from 'vue';

export interface ProgressProps {
  /** 进度百分比 */
  percentage: number;
  /** 进度条类型 */
  type?: 'line' | 'circle';
  /**进度条显示文字内置在进度条内,此时进度条高度适当增加（仅 type 为 'line' 时可用） */
  textInside?: boolean;
  /** 进度条状态 */
  status?: 'success' | 'error' | 'warning' | 'info';
  /** 是否显示进度条文字 */
  showText?: boolean;
  /** 自定义进度条文字格式 */
  formatText?: (percentage: number) => string;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  percentage: 0,
  type: 'line',
  textInside: false,
  showText: true,
  status: 'info',
  customClass: '',
  customStyle: () => ({}),
} as const;
