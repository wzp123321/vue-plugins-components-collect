/**
 * 纯文本过滤工具
 *
 * 来源: components/directive/directive-input-filter.ts 中 handleSearchInput 的过滤规则
 * 用途: 过滤可能引发注入的特殊字符(纯字符串入参场景,无 DOM 依赖)
 */

/** 预编译正则: 过滤反斜杠 / 分号 / 单引号 / 双引号 / 尖括号 */
const SPECIAL_CHAR_REGEX = /[\\;'"<>]/g;

/** 预编译正则: 过滤所有空白字符 */
const SPACE_REGEX = /\s+/g;

export interface FilterTextOptions {
  /** 是否保留空格,默认 true */
  allowSpace?: boolean;
}

/**
 * 过滤纯文本中的特殊字符
 * - 默认移除: \  ;  '  "  <  >
 * - allowSpace 为 false 时再移除所有空白
 * @param value 待过滤文本
 * @param options 过滤选项
 * @returns 过滤后的文本
 */
export const filterText = (
  value: string,
  options: FilterTextOptions = {},
): string => {
  if (!value) return value;
  const { allowSpace = true } = options;
  let result = value.replace(SPECIAL_CHAR_REGEX, '');
  if (!allowSpace) {
    result = result.replace(SPACE_REGEX, '');
  }
  return result;
};
