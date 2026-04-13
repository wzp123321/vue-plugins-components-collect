/**
 * StepsItem 步骤项组件 Props 定义
 * @description 简化版步骤项组件
 */
import type { CSSProperties } from 'vue';

export interface StepsItemProps {
  /** 步骤标题 */
  title?: string;
  /** 步骤描述 */
  description?: string;
  /** 步骤图标 */
  icon?: string;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  title: '',
  description: '',
  icon: '',
  customClass: '',
  customStyle: () => ({}),
} as const;
