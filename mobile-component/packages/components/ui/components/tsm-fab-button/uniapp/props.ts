/**
 * fab-button 卡片组件 Props 定义
 */
import type { CSSProperties } from 'vue';

export interface FabButtonProps {
  /** 标题 */
  title?: string;
  /** type */
  type?: 'primary' | 'secondary';
  /** 状态 */
  state?: 'default' | 'disabled';
  /** shape */
  shape?: 'rectangle' | 'circle';

  customStyle?: Record<string, any>;
}

export const defaultProps = {
  type: 'primary',
  state: 'default',
  shape: 'rectangle',
};
