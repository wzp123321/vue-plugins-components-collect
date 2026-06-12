/**
 * ts-mobile-ui Form 验证系统错误消息模板
 *
 * @description 提供默认错误消息模板和格式化函数
 * @version 1.0.0
 */

/**
 * 默认错误消息模板
 *
 * @description
 * - 支持 ${name} 占位符（字段名）
 * - 支持 ${validate} 占位符（验证值，如 min/max 的数值）
 */
export const DEFAULT_MESSAGES: Record<string, string> = {
  required: '${name}不能为空',
  boolean: '${name}必须是布尔值',
  date: '${name}格式不正确',
  email: '请输入正确的${name}',
  url: '请输入正确的${name}',
  idcard: '请输入正确的身份证号码',
  telnumber: '请输入正确的手机号码',
  number: '${name}必须是数字',
  min: '${name}不能少于${validate}个字符',
  max: '${name}不能超过${validate}个字符',
  len: '${name}必须是${validate}个字符',
  pattern: '${name}格式不正确',
  enum: '${name}必须是${validate}之一',
  whitespace: '${name}不能为空格',
  validator: '${name}验证失败',
};

/**
 * 格式化错误消息
 *
 * @description 替换 ${name} 和 ${validate} 占位符
 *
 * @param template - 消息模板
 * @param name - 字段名
 * @param validate - 验证值（如 min/max 的数值）
 * @returns 格式化后的消息
 */
export function formatMessage(template: string, name: string, validate: any): string {
  return template.replace(/\$\{name\}/g, name || '').replace(/\$\{validate\}/g, String(validate ?? ''));
}

/**
 * 获取默认错误消息
 *
 * @description
 * - 根据验证规则类型获取默认消息
 * - 自动格式化消息
 * - 优先使用 label（更友好），name 作为降级
 *
 * @param ruleKey - 验证规则类型（如 required、min、max）
 * @param label - 字段标签（优先使用）
 * @param name - 字段名（降级使用）
 * @param validate - 验证值
 * @param customMessages - 自定义消息模板（可覆盖默认）
 * @returns 格式化后的错误消息
 */
export function getDefaultMessage(
  ruleKey: string,
  label?: string,
  name?: string,
  validate?: any,
  customMessages?: Record<string, string>
): string {
  // 优先使用自定义消息，否则使用默认消息
  const template = customMessages?.[ruleKey] || DEFAULT_MESSAGES[ruleKey] || '${name}验证失败';

  // 优先使用 label（更友好），name 作为降级
  const displayName = label || name || '';

  return formatMessage(template, displayName, validate);
}
