/**
 * tsm-form-item 组件类型定义
 */

import type { Trigger, ValidateResult } from '../../../libs/uniapp/validators/types';
/**
 * FormItem 验证结果
 */
export interface FormItemValidateResult {
  /** 字段名 */
  name: string;

  /** 验证结果 */
  result: boolean;

  /** 错误列表 */
  errorList?: ValidateResult[];
}

/**
 * FormItem 组件上下文（通过 provide 提供给输入组件）
 *
 * @description 输入组件通过 inject 获取此上下文，用于触发验证
 * @key onBlur/onValueChange 内部处理 readonly 判断，控件无需关心
 *
 * @example 输入组件接入
 * ```typescript
 * const formItemContext = inject<FormItemContext | null>('formItemContext', null)
 *
 * // blur 时触发验证（无需判断 readonly）
 * formItemContext?.onBlur()
 *
 * // change 时触发验证（无需判断 readonly）
 * formItemContext?.onValueChange(value)
 * ```
 */
export interface FormItemContext {
  /** 字段名（对应 model 的 key） */
  name: string;

  /** 只读状态（合并 Form 和 FormItem 的 readonly 配置） */
  readonly: boolean;

  /**
   * blur 时触发验证
   * @description 内部已处理 readonly 判断，控件直接调用即可
   */
  onBlur: () => void;

  /**
   * 值变化时触发验证
   * @description 内部已处理 readonly 判断，控件直接调用即可
   * @param value - 当前字段值
   */
  onValueChange: (value: any) => void;

  /**
   * 验证方法（供业务代码直接调用）
   * @param trigger - 触发时机
   * @returns 验证结果
   */
  validate: (trigger: Trigger) => Promise<FormItemValidateResult>;

  /**
   * 仅验证方法（不显示错误信息，不更新状态）
   * @param trigger - 触发时机
   * @returns 验证结果
   */
  validateOnly: (trigger: Trigger) => Promise<FormItemValidateResult>;

  /** 清除验证状态 */
  clearValidate: () => void;

  /**
   * 重置字段（清除验证状态）
   * @description 数据重置由 Form 组件负责，FormItem 只清除验证状态
   */
  resetField: () => void;
}
