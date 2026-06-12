/**
 * tsm-form 组件类型定义
 */
import type { FormRule, ValidateResult, Trigger } from '../../../libs/uniapp/validators/types';
import type { FormItemValidateResult } from '../../tsm-form-item/uniapp/type';

/**
 * 表单验证规则集合
 * key 为字段名，value 为该字段的验证规则数组
 */
export type FormRules = Record<string, FormRule[]>;

/**
 * 验证状态
 */
export enum ValidateStatus {
  /** 待验证 */
  TO_BE_VALIDATED = 0,
  /** 验证通过 */
  SUCCESS = 1,
  /** 验证失败 */
  FAIL = 2,
}

/**
 * FormItem 组件实例接口（供 Form 调用）
 * @reference TDesign form.vue children 管理
 */
export interface FormItemInstance {
  /** 字段名 */
  name: string;

  /** 验证方法 */
  validate: (
    model: Record<string, any>,
    trigger: Trigger,
    showErrorMessage?: boolean
  ) => Promise<FormItemValidateResult>;

  /** 仅验证方法（不显示错误信息，不更新状态） */
  validateOnly: (trigger: Trigger) => Promise<FormItemValidateResult>;

  /** 清除验证状态 */
  clearValidate: () => void;

  /**
   * 重置字段（清除验证状态）
   * @description 数据重置由 Form 组件负责，FormItem 只清除验证状态
   */
  resetField: () => void;

  /** 滚动到视图 */
  scrollIntoView: (type: 'smooth' | 'auto') => void;
}

/**
 * Form 组件上下文（通过 provide 提供给 FormItem）
 */
export interface FormContext {
  /** 表单数据对象 */
  model: Record<string, any>;

  /** 验证规则 */
  rules: FormRules;

  /** 错误消息模板 */
  errorMessage?: Record<string, string>;

  /** label 对齐方式 */
  labelAlign: 'left' | 'right' | 'top';

  /** label 宽度 */
  labelWidth: number;

  /** 验证失败时滚动到第一个错误 */
  scrollToFirstError: '' | 'smooth' | 'auto';

  /** 是否显示错误信息 */
  showErrorMessage: boolean;

  /** 是否显示必填星号 */
  requiredMark: boolean;

  /** 必填星号位置 */
  requiredMarkPosition: 'left' | 'right';

  /** 只读模式 */
  readonly: boolean;

  /** 只读模式下是否显示必填星号 */
  requiredMarkOnReadonly: boolean;

  /** 添加子组件 */
  addChild: (child: FormItemInstance) => void;

  /** 移除子组件 */
  removeChild: (name: string) => void;
}

/**
 * 验证返回结果（Form.validate 方法）
 */
export type FormValidateResult = true | Record<string, ValidateResult[]>;
