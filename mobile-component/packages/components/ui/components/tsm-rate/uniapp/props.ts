import type { CSSProperties } from 'vue';

export interface RateProps {
  /** 当前评分值（5分制） */
  value?: number;
  /** 是否禁用 */
  disabled?: boolean;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  value: 0,
  disabled: false,
  customClass: '',
  customStyle: () => ({}),
} as const;
