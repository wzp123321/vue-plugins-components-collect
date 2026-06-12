/**
 * Tag 标签组件 Props 定义
 * @description 简化版标签组件
 */
export interface TagProps {
  /** 是否为可选中标签 */
  selectable?: boolean;
  /** 可选中标签类型 */
  selectType?: 'input' | 'select';
  /** 标签类型 */
  type?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  /** 标签大小 */
  size?: 'small' | 'medium' | 'large';
  /** 标签形状 默认 square，可选 bubble，对应气泡 */
  shape?: 'square' | 'bubble';
  /** 标签文字 */
  text?: string;
  /** 可操作标签唯一标识 */
  value?: string | number | null;
  /** select 类型中间展示文本 */
  label?: string;
  /** select 类型选中状态 */
  selected?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否可关闭 */
  closable?: boolean;
  /** 是否显示边框 */
  borderless?: boolean;
}

export const defaultProps = {
  selectable: false,
  selectType: 'select',
  type: 'default',
  size: 'medium',
  shape: 'square',
  text: '',
  value: '',
  label: '',
  selected: false,
  disabled: false,
  closable: false,
  borderless: false,
} as const;
