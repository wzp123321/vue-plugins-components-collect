/**
 * ListItem 列表项组件 Props 定义
 * @description 简化版列表项组件
 */
import type { CSSProperties } from 'vue';

export interface ListItemProps {
  /** 标题 */
  title?: string;
  /** 描述 */
  desc?: string;
  /** 是否显示右侧箭头 */
  arrow?: boolean;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  title: '',
  desc: '',
  arrow: false,
  customClass: '',
  customStyle: () => ({}),
} as const;
