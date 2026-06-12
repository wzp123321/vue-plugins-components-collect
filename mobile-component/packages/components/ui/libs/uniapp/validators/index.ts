/**
 * ts-mobile-ui Form 验证系统核心模块
 *
 * @description 提供验证函数和统一导出
 * @version 1.0.0
 */

import type { FormRule, ValidateResult, ValidateContext } from './types';

import { isValueEmpty } from './validator';
import { VALIDATE_MAP } from './rules';
import { getDefaultMessage } from './errorMessage';

// 导出类型
export * from './types';

// 导出验证器（来自 TDesign validator.ts）
export * from './validator';

// 导出错误消息
export * from './errorMessage';

// 导出验证规则
export { VALIDATE_MAP } from './rules';

/**
 * 验证单个规则
 *
 * @description
 * - 非必填 + 空值 → 直接返回通过（除非有 validator）
 * - 找到第一个有效的验证规则执行
 * - 自动补充默认错误消息
 *
 * @param value - 要验证的值
 * @param rule - 验证规则
 * @param context - 验证上下文（含 formData 和 name）
 * @param customMessages - 自定义错误消息模板
 * @returns 验证结果
 */
export async function validateOneRule(
  value: unknown,
  rule: FormRule,
  context?: ValidateContext,
  customMessages?: Record<string, string>
): Promise<ValidateResult> {
  // 非必填 + 空值 → 直接返回通过（除非有 validator）
  if (!rule.required && isValueEmpty(value) && !rule.validator) {
    return { result: true };
  }

  // 遍历规则的所有验证类型
  for (const key of Object.keys(rule)) {
    // 跳过非验证类型的字段（message、trigger 等）
    if (['message', 'trigger'].includes(key)) continue;

    const fn = VALIDATE_MAP[key];
    const options = rule[key as keyof FormRule];

    // 规则未启用或验证函数不存在，跳过
    // 注意：options === 0 时也要校验（如 max: 0）
    if (options === undefined || options === false || !fn) continue;

    // 执行验证（区分 required: true 和其他规则）
    const validateOptions = options === true ? undefined : options;
    const valid = await fn(value, validateOptions, context);

    // 处理验证结果
    let result: ValidateResult;

    if (typeof valid === 'boolean') {
      result = { result: valid, ...rule };
    } else {
      // 自定义验证返回 ValidateResult
      result = valid as ValidateResult;
    }

    // 验证失败，返回错误结果
    if (!result.result) {
      if (!result.message) {
        // 使用规则自定义消息或默认消息
        // 优先使用 label（更友好），name 作为降级
        result.message =
          rule.message || getDefaultMessage(key, context?.label, context?.name, validateOptions, customMessages);
      }

      return result;
    }
  }

  // 所有规则通过
  return { result: true };
}

/**
 * 验证多个规则
 *
 * @description 对一个值执行多个验证规则，返回所有验证结果
 *
 * @param value - 要验证的值
 * @param rules - 验证规则数组
 * @param context - 验证上下文
 * @param customMessages - 自定义错误消息模板
 * @returns 验证结果数组
 */
export async function validateRules(
  value: unknown,
  rules: FormRule[],
  context?: ValidateContext,
  customMessages?: Record<string, string>
): Promise<ValidateResult[]> {
  if (!rules || rules.length === 0) {
    return [{ result: true }];
  }

  return Promise.all(rules.map(rule => validateOneRule(value, rule, context, customMessages)));
}

/**
 * 分析验证结果
 *
 * @description 过滤失败结果，返回错误列表
 *
 * @param results - 验证结果数组
 * @returns 错误列表
 */
export function analysisValidateResult(results: ValidateResult[]): ValidateResult[] {
  return results.filter(r => r.result !== true);
}
