/**
 * tsm-form-item 组件 Props 定义
 */

import type { FormRule } from '../../../libs/uniapp/validators/types';

/**
 * FormItem 组件 Props
 */
export interface FormItemProps {
  /** 标签文本 */
  label?: string;

  /** 字段名，对应 model 中的 key */
  name: string;

  /** 表单项帮助说明 */
  help?: string;

  /** 是否显示必填星号（可覆盖 Form 的配置） */
  requiredMark?: boolean;

  /** 验证规则（可覆盖 Form.rules[name]） */
  rules?: FormRule[];

  /** label 对齐方式（可覆盖 Form 的配置） */
  labelAlign?: 'left' | 'right' | 'top';

  /** label 宽度（可覆盖 Form 的配置） */
  labelWidth?: number;

  /** 只读模式（可覆盖 Form 的配置） */
  readonly?: boolean;

  /** 自定义样式 */
  customStyle?: Record<string, any>;
}

/**
 * FormItem 组件默认 Props 值
 * 注意：部分配置未设置时从 Form 继承
 * name 是必需属性
 */
export const defaultFormItemProps = {
  label: '',
  name: '',
  help: '',
  requiredMark: undefined, // 未设置时继承 Form 配置，并根据 rules 判断是否必填
  rules: undefined, // 未设置时使用 Form.rules[name]
  labelAlign: undefined, // 未设置时继承 Form.labelAlign
  labelWidth: undefined, // 未设置时继承 Form.labelWidth
  readonly: undefined, // 未设置时继承 Form.readonly
  customStyle: () => ({}) as Record<string, any>,
};
