/**
 * Card 卡片组件 Props 定义
 */
import type { CSSProperties } from 'vue';

export interface CardProps {
  /** 卡片标题 */
  title?: string;
  /** 卡片副标题 */
  subTitle?: string;
  /** 是否显示标题 */
  showTitle?: boolean;
  /** 是否显示信息图标 */
  showInfoIcon?: boolean;
  /** 是否显示更多操作面板 */
  showMorePanel?: boolean;
  /** 是否显示选项面板 */
  showOptionPanel?: boolean;
}

export const defaultProps = {
  showTitle: true,
  showInfoIcon: true,
  showMorePanel: true,
  showOptionPanel: true,
};
