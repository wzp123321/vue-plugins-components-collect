/**
 * 验证系统类型定义
 */

/**
 * 验证触发时机
 * @description 'all' 用于表单提交时验证所有规则
 */
export type Trigger = 'blur' | 'change' | 'all';

/**
 * 自定义验证函数返回结果
 */
export interface CustomValidateResult {
  /** 验证结果 */
  result: boolean;
  /** 错误消息 */
  message?: string;
}

/**
 * 自定义验证函数类型
 */
export type CustomValidator = (
  value: any,
  context?: { formData: Record<string, any>; name: string }
) => boolean | Promise<boolean> | CustomValidateResult | Promise<CustomValidateResult>;

/**
 * 单条验证规则
 */
export interface FormRule {
  /** 必填验证 */
  required?: boolean;

  /** 格式验证 */
  email?: boolean;
  url?: boolean;
  idcard?: boolean;
  telnumber?: boolean;

  /** 类型验证 */
  number?: boolean;

  /** 长度验证（中文算2字符） */
  min?: number;
  max?: number;
  len?: number;

  /** 正则验证 */
  pattern?: RegExp | string;

  /** 枚举验证 */
  enum?: string[];

  /** 空格验证 */
  whitespace?: boolean;

  /** 自定义验证函数 */
  validator?: CustomValidator;

  /** 错误信息（覆盖默认模板） */
  message?: string;

  /** 触发时机 */
  trigger?: Trigger | Trigger[];
}

/**
 * 单条验证结果
 */
export interface ValidateResult {
  /** 验证结果 */
  result: boolean;
  /** 错误消息 */
  message?: string;
  /** 其他字段（保留规则中的配置） */
  [key: string]: any;
}

/**
 * 验证上下文
 */
export interface ValidateContext {
  /** 表单数据 */
  formData?: Record<string, any>;
  /** 字段名 */
  name?: string;
  /** 字段标签（优先用于错误消息） */
  label?: string;
}

/**
 * 验证函数类型
 * @description 用于 VALIDATE_MAP 中每个验证规则的函数签名
 */
export type ValidateFunction = (
  value: any,
  options?: any,
  context?: ValidateContext
) => boolean | Promise<boolean | ValidateResult>;
