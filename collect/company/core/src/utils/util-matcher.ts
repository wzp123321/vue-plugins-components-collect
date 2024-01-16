//#region 数据类型匹配器
/**
 * 数据类型匹配器
 * !返回类型字符串已经过小写处理
 * @param target 数据源
 * @returns 数据源类型
 */
export function FTypeMatcher(target: unknown): string;
/**
 * 数据类型匹配器
 * @param target 数据源
 * @param matcher 匹配类型
 * @returns 类型匹配结果
 */
export function FTypeMatcher(target: unknown, matcher: string): boolean;
export function FTypeMatcher(target: unknown, matcher?: string): string | boolean {
  const type = Object.prototype.toString.call(target).slice(8, -1).toLocaleLowerCase();
  return matcher ? type === matcher.toLocaleLowerCase() : type;
}
//#endregion

//#region 参数匹配器
/**
 * 单参数匹配器
 * *未成功匹配时将返回空字符串
 * @param target 目标字符串
 * @param matcher 匹配规则
 * @returns 匹配值
 */
function FParameterMatcher(target: string, matcher: RegExp): string {
  return target.match(matcher)?.[2] ?? '';
}

/**
 * 多参数匹配器
 * *匹配值集合与待匹配键集合严格对应，其中未成功匹配的键将与空字符串对应
 * @param target 目标字符串
 * @param separator 分隔符 -[0]：键值分隔符 -[1]：参数项分隔符
 * @param keys 待匹配键集合
 * @returns 匹配值集合
 */
function FParametersMatcher(target: string, separator: [string, string], ...keys: string[]): string[] {
  return keys.map((key) =>
    FParameterMatcher(
      target,
      new RegExp(`(^|${separator[1]})${key}${separator[0]}([^${separator[1]}]*)(${separator[1]}|$)`, 'i')
    )
  );
}

/**
 * Cookie参数匹配器
 * *所有待匹配键都将包含在结果集中，其中未成功匹配的键将以空字符串形式填充
 * !匹配值已解码
 * @param keys 待匹配键集合
 * @returns 包含所有待匹配键及其对应值的集合
 */
export function FCookieMatcher<T extends string[]>(...keys: T): Map<T[number], string> {
  const result = new Map<T[number], string>();
  const values = FParametersMatcher(document.cookie, ['=', '; '], ...keys);
  for (let i = 0; i < keys.length; i++) {
    result.set(keys[i], decodeURIComponent(values[i]));
  }
  return result;
}

/**
 * 请求头/响应头参数匹配器
 * *所有待匹配键都将包含在结果集中，其中未成功匹配的键将以空字符串形式填充
 * !匹配值已解码
 * @param headers 请求头/响应头
 * @param target 目标字段
 * @param keys 待匹配键集合
 * @returns 包含所有待匹配键及其对应值的集合
 */
export function FHeaderMatcher<T extends string[]>(
  headers: Headers,
  target: string,
  ...keys: T
): Map<T[number], string> {
  const result = new Map<T[number], string>();
  const values = FParametersMatcher(headers.get(target) ?? '', ['=', ';'], ...keys);
  for (let i = 0; i < keys.length; i++) {
    result.set(keys[i], decodeURIComponent(values[i]));
  }
  return result;
}

/**
 * 地址栏参数匹配器
 * *所有待匹配键都将包含在结果集中，其中未成功匹配的键将以空字符串形式填充
 * !匹配值已解码
 * @param keys 待匹配键集合
 * @returns 包含所有待匹配键及其对应值的集合
 */
export function FUrlMatcher<T extends string[]>(...keys: T): Map<T[number], string> {
  const result = new Map<T[number], string>();
  const values = FParametersMatcher(window.location.search.substring(1), ['=', '&'], ...keys);
  for (let i = 0; i < keys.length; i++) {
    result.set(keys[i], decodeURIComponent(values[i]));
  }
  return result;
}
//#endregion
