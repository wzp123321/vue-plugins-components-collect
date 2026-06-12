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
  /**步骤状态,已完成：success，进行中：inactive，未开始：unstart，错误：error.
   * 不设置则根据 steps的 current 确定状态，current步骤默认inactive,current之前的默认success,之后的默认unstart*/
  status?: 'success' | 'inactive' | 'unstart' | 'error' | '';
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  title: '',
  description: '',
  status: '',
  customClass: '',
  customStyle: () => ({}),
} as const;
