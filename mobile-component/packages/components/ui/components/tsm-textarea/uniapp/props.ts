/**
 * Textarea 多行输入框组件 Props 定义
 * @description 简化版多行输入框组件
 */
import type { CSSProperties } from 'vue';

export interface TextareaProps {
  /** 输入框的值 */
  value?: string;
  /** 占位符 */
  placeholder?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 最大长度 */
  maxlength?: number;
  /** 是否自动聚焦 */
  autofocus?: boolean;
  /** 是否显示字数统计 */
  showCount?: boolean;
  /** 行数 */
  rows?: number;
  /** 是否为错误状态（边框变红） */
  error?: boolean;
  /** 是否只读 */
  readonly?: boolean;
  /** 高度 */
  height?: string | number;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

export const defaultProps = {
  value: '',
  placeholder: '请输入',
  disabled: false,
  maxlength: -1,
  autofocus: false,
  showCount: false,
  rows: 3,
  error: false,
  readonly: false,
  height: undefined,
  customClass: '',
  customStyle: () => ({}),
} as const;
