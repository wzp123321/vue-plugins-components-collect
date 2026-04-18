/**
 * Tabs 标签页组件 Props 定义
 * @description 简化版标签页组件，支持滚动和滑块动画
 */
import type { CSSProperties } from 'vue';

export interface TabItem {
  /** 标签名称 */
  name?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 图标名称 */
  icon?: string;
  /** 徽标配置 */
  badge?: Record<string, any>;
}

export interface TabsProps {
  /** 标签列表 */
  list?: TabItem[];
  /** 当前激活的标签索引 */
  current?: number;
  /** 滑块颜色 */
  lineColor?: string;
  /** 滑块宽度 */
  lineWidth?: number | string;
  /** 滑块高度 */
  lineHeight?: number | string;
  /** 滑块移动动画时长 */
  duration?: number;
  /** 激活状态样式 */
  activeStyle?: CSSProperties;
  /** 未激活状态样式 */
  inactiveStyle?: CSSProperties;
  /** 标签项样式 */
  itemStyle?: CSSProperties;
  /** 是否可滚动 */
  scrollable?: boolean;
  /** 从list元素对象中读取的键名 */
  keyName?: string;
  /** 尺寸 small | large */
  size?: 'small' | 'large';
  /** 是否显示列表图标 */
  showListIcon?: boolean;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  list: () => [],
  current: 0,
  lineColor: '#2979ff',
  lineWidth: '40rpx',
  lineHeight: '3px',
  duration: 300,
  activeStyle: { color: '#2979ff', fontWeight: 'bold' },
  inactiveStyle: { color: '#606266' },
  itemStyle: () => ({}),
  scrollable: false,
  keyName: 'name',
  size: 'large',
  showListIcon: false,
  customClass: '',
  customStyle: () => ({}),
} as const;
