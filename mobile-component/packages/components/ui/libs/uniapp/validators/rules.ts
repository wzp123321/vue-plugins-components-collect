/**
 * ts-mobile-ui Form 验证规则实现
 *
 * @description 内置验证规则映射表，与 TDesign VALIDATE_MAP 一致
 * @version 1.0.0
 * @reference TDesign form-model.ts
 */

import type { ValidateContext, ValidateFunction, ValidateResult } from './types';

import { isValueEmpty, getCharacterLength, isNumber, isBoolean, isDate, isEmail, isURL } from './validator';

// ==================== 内置正则 ====================

/**
 * 验证身份证格式（支持15位、18位、17位+x）
 */
const IDCARD_REGEX = /^(\d{18,18}|\d{15,15}|\d{17,17}x)$/i;

/**
 * 验证手机号格式（中国大陆）
 */
const TELNUMBER_REGEX = /^1[3-9]\d{9}$/;

// ==================== VALIDATE_MAP ====================

/**
 * 内置验证规则映射表
 *
 * @description 包含 16 个内置验证规则，与 TDesign VALIDATE_MAP 一致
 * @reference TDesign form-model.ts
 */
export const VALIDATE_MAP: Record<string, ValidateFunction> = {
  // ==================== 必填验证 ====================
  /**
   * 必填验证
   */
  required: (val: unknown): boolean => !isValueEmpty(val),

  // ==================== 类型验证 ====================
  /**
   * 数字类型验证
   * @description 仅判断 number 类型，不包含数字字符串
   */
  number: (val: unknown): boolean => isNumber(val),

  /**
   * 布尔类型验证
   */
  boolean: (val: unknown): boolean => isBoolean(val),

  /**
   * 日期验证
   * @description 支持 Date 对象和 YYYY/MM/DD、YYYY-MM-DD 格式字符串
   */
  date: (val: unknown): boolean => {
    if (isValueEmpty(val)) return false;
    return isDate(val as string | Date);
  },

  // ==================== 格式验证 ====================
  /**
   * 邮箱格式验证
   * @description 使用 TDesign 完整实现，支持多种选项
   */
  email: (val: unknown): boolean => {
    if (isValueEmpty(val)) return false;
    return isEmail(val as string);
  },

  /**
   * URL 格式验证
   * @description 使用 TDesign 完整实现，支持多种选项
   */
  url: (val: unknown): boolean => {
    if (isValueEmpty(val)) return false;
    return isURL(val as string);
  },

  /**
   * 身份证格式验证
   * @description 支持15位、18位、17位+x
   */
  idcard: (val: unknown): boolean => {
    if (isValueEmpty(val)) return false;
    return IDCARD_REGEX.test(val as string);
  },

  /**
   * 手机号格式验证（中国大陆）
   */
  telnumber: (val: unknown): boolean => {
    if (isValueEmpty(val)) return false;
    return TELNUMBER_REGEX.test(val as string);
  },

  // ==================== 长度验证（中文算2字符） ====================
  /**
   * 最大长度/值验证
   * @description
   * - 数字：值 <= num
   * - 字符串：字符长度 <= num（中文算2字符）
   */
  max: (val: unknown, num: number): boolean => {
    if (isValueEmpty(val)) return false;
    return isNumber(val) ? (val as number) <= num : getCharacterLength(val as string) <= num;
  },

  /**
   * 最小长度/值验证
   * @description
   * - 数字：值 >= num
   * - 字符串：字符长度 >= num（中文算2字符）
   */
  min: (val: unknown, num: number): boolean => {
    if (isValueEmpty(val)) return false;
    return isNumber(val) ? (val as number) >= num : getCharacterLength(val as string) >= num;
  },

  /**
   * 精确长度验证（仅字符串）
   * @description 仅验证字符串长度（中文算2字符），不验证数字
   */
  len: (val: unknown, num: number): boolean => {
    if (isValueEmpty(val)) return false;
    return getCharacterLength(val as string) === num;
  },

  // ==================== 其他验证 ====================
  /**
   * 正则验证
   */
  pattern: (val: unknown, reg: string | RegExp): boolean => {
    if (isValueEmpty(val)) return false;
    const regex = typeof reg === 'string' ? new RegExp(reg) : reg;
    return regex.test(val as string);
  },

  /**
   * 枚举验证
   */
  enum: (val: unknown, list: string[]): boolean => {
    if (isValueEmpty(val)) return false;
    return list.includes(val as string);
  },

  /**
   * 空格验证（不能全是空格或空字符串）
   */
  whitespace: (val: unknown): boolean => {
    return !(/^\s+$/.test(val as string) || val === '');
  },

  // ==================== 自定义验证 ====================
  /**
   * 自定义验证器
   * @description 支持异步验证
   */
  validator: async (
    val: unknown,
    fn: (val: unknown, ctx?: ValidateContext) => unknown,
    ctx?: ValidateContext
  ): Promise<boolean | ValidateResult> => {
    const result = await fn(val, ctx);
    return result as boolean | ValidateResult;
  },
};
