/**
 * Cascader 级联选择器组件 Props 定义
 * @description 多级级联选择器，支持省市区等多级联动选择
 */
import type { CSSProperties } from 'vue';

/**
 * Cascader 选项类型（泛型，支持 string | number 类型推断）
 * @description children 使用相同泛型，保证各级 value 类型一致
 */
export interface CascaderOption<T extends string | number = string | number> {
  /** 显示文本 */
  label: string;
  /** 选中值 */
  value: T;
  /** 子选项列表（使用相同泛型类型） */
  children?: CascaderOption<T>[];
  /** 是否禁用 */
  disabled?: boolean;
  /** 自定义扩展字段 */
  [key: string]: any;
}

export interface CascaderKeys {
  label?: string;
  value?: string;
  children?: string;
  disabled?: string;
}

/**
 * Cascader Props（泛型，根据 options 的 value 类型自动推断）
 */
export interface CascaderProps<T extends string | number = string | number> {
  /** 级联数据 */
  options: CascaderOption<T>[];
  /** 弹层显隐（v-model） */
  show: boolean;
  /** 选中值（v-model） */
  value?: T;
  /** 默认选中值（非受控） */
  defaultValue?: T;
  /** 标题文本 */
  title?: string;
  /** 字段映射配置 */
  keys?: CascaderKeys;
  /** 是否允许任意级别选中 */
  checkStrictly?: boolean;
  /** 占位提示文字 */
  placeholder?: string;
  /** 确认按钮文字 */
  confirmText?: string;
  /** 是否显示关闭按钮 */
  closeable?: boolean;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  options: () => [] as CascaderOption[],
  show: false,
  title: '',
  keys: () => ({
    label: 'label',
    value: 'value',
    children: 'children',
    disabled: 'disabled',
  }),
  checkStrictly: false,
  placeholder: '请选择',
  confirmText: '确定',
  closeable: true,
  customClass: '',
  customStyle: () => ({}),
} as const;
