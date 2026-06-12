/**
 * Tabs 标签页组件 Props 定义
 * @description 简化版标签页组件，支持滚动和滑块动画
 */

export interface TabItem {
  /** 标签名称 */
  name?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 扩展字段 */
  [key: string]: unknown;
}

export interface TabsProps {
  /** 标签列表 */
  list?: TabItem[];
  /** 当前激活的标签索引 */
  current?: number;
  /** 滑块移动动画时长 */
  duration?: number;
  /** 是否可滚动 */
  scrollable?: boolean;
  /** 是否等距布局, 默认false */
  isometric?: boolean;
  /** 从list元素对象中读取的键名 */
  keyName?: string;
  /** 尺寸 small | large */
  size?: 'small' | 'large';
  /** item样式类型：default 默认 | tag 标签样式 */
  itemType?: 'default' | 'tag';
}

export const defaultProps = {
  list: () => [],
  current: 0,
  duration: 300,
  scrollable: false,
  isometric: false,
  keyName: 'name',
  size: 'large',
  itemType: 'default',
} as const;
