/**
 * Picker 选择器组件 Props 定义
 * @description 单列选择器，基于 picker-view 实现
 */
import type { CSSProperties } from 'vue';

/**
 * Picker 选项类型（泛型，支持 string | number 类型推断）
 */
export interface PickerOption<T extends string | number = string | number> {
  /** 显示文本 */
  label: string;
  /** 选中值 */
  value: T;
}

/**
 * Picker Props（泛型，根据 options 的 value 类型自动推断）
 */
export interface PickerProps<T extends string | number = string | number> {
  /** 选项数组 */
  options: PickerOption<T>[];
  /** 弹层显示状态（v-model:show） */
  show: boolean;
  /** 标题文本 */
  title?: string;
  /** 当前选中值（v-model:value，受控模式） */
  value?: T;
  /** 默认选中值（非受控模式） */
  defaultValue?: T;
  /** 确认按钮文字 */
  confirmText?: string;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  options: () => [] as PickerOption[],
  show: false,
  title: '',
  confirmText: '确定',
  customClass: '',
  customStyle: () => ({}),
} as const;
