/**
 * tsm-form 组件 Props 定义
 */

import type { FormRules } from './types';

/**
 * Form 组件 Props
 */
export interface FormProps {
  /** 表单数据对象 */
  model: Record<string, any>;

  /** 验证规则 */
  rules?: FormRules;

  /** 错误消息模板 */
  errorMessage?: Record<string, string>;

  /** label 对齐方式 */
  labelAlign?: 'left' | 'right' | 'top';

  /** label 宽度（px） */
  labelWidth?: number;

  /** 验证失败时滚动到第一个错误：smooth-平滑滚动，auto-即时滚动 */
  scrollToFirstError?: '' | 'smooth' | 'auto';

  /** 是否显示错误信息 */
  showErrorMessage?: boolean;

  /** 是否显示必填星号 */
  requiredMark?: boolean;

  /** 必填星号位置：left-左侧，right-右侧 */
  requiredMarkPosition?: 'left' | 'right';

  /** 只读模式：禁止编辑，不触发验证 */
  readonly?: boolean;

  /** 只读模式下是否显示必填星号 */
  requiredMarkOnReadonly?: boolean;

  /** 自定义样式 */
  customStyle?: Record<string, any>;
}

/**
 * Form 组件默认 Props 值
 * 注意：model 是必需属性，使用工厂函数形式
 */
export const defaultFormProps = {
  model: () => ({}) as Record<string, any>,
  rules: () => ({}) as FormRules,
  errorMessage: undefined,
  labelAlign: 'top' as const,
  labelWidth: 80,
  scrollToFirstError: '' as const,
  showErrorMessage: true,
  requiredMark: true,
  requiredMarkPosition: 'right' as const,
  readonly: false,
  requiredMarkOnReadonly: false,
  customStyle: () => ({}) as Record<string, any>,
};
