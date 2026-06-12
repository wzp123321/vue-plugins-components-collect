/**
 * ActionSheet 操作菜单组件 Props 定义
 */
import type { CSSProperties } from 'vue';

export interface ActionItem {
  /** 按钮文字 */
  text?: string;
  /** 图标（URL 或 icon name / emoji） */
  icon?: string;
  /** 描述文字 */
  description?: string;
  /** 按钮类型：default | danger | disabled */
  type?: 'default' | 'danger' | 'disabled';
}

export interface ActionSheetProps {
  /** 是否显示 */
  show?: boolean;
  /** 菜单项列表 */
  actions?: ActionItem[];
  /** 取消按钮文字 */
  cancelText?: string;
  /** 是否显示取消按钮 */
  showCancel?: boolean;
  /** 标题（兼容旧版） */
  title?: string;
  /** 顶部描述 */
  description?: string;
  /** 顶部描述对齐方式,宫格模式默认居左 */
  descriptionAlign?: 'center' | 'left';
  /** 顶部描述分割线是否显示，宫格模式默认不显示 */
  showDescriptionDivider?: boolean;
  /** 按钮内容对齐方式（仅列表模式） */
  itemAlign?: 'center' | 'left';
  /** 列表最大高度 */
  maxHeight?: string;
  /** 面板模式：list 列表 | grid 宫格 */
  mode?: 'list' | 'grid';
  /** 宫格布局方式：stack 堆叠 | scroll 滚动 */
  gridMode?: 'stack' | 'scroll';
  /** 关闭前回调，返回 false 可阻止关闭 */
  beforeClose?: (action: 'select' | 'cancel' | 'overlay') => boolean | Promise<boolean>;
  /** 按钮文字对应的字段名，默认 label */
  textKey?: string;
  /** 按钮值对应的字段名 */
  valueKey?: string;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  show: false,
  actions: () => [],
  cancelText: '取消',
  showCancel: true,
  title: '',
  description: '',
  descriptionAlign: undefined,
  showDescriptionDivider: undefined,
  itemAlign: 'center',
  maxHeight: undefined,
  mode: 'list',
  gridMode: 'stack',
  textKey: 'label',
  valueKey: '',
  customClass: '',
  customStyle: () => ({}),
} as const;
