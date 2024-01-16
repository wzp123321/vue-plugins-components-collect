/**
 * 数据类型匹配器
 * !返回类型字符串已经过小写处理
 * @param target 数据源
 * @returns 数据源类型
 */
export declare function FTypeMatcher(target: unknown): string;
/**
 * 数据类型匹配器
 * @param target 数据源
 * @param matcher 匹配类型
 * @returns 类型匹配结果
 */
export declare function FTypeMatcher(target: unknown, matcher: string): boolean;
/**
 * Cookie参数匹配器
 * *所有待匹配键都将包含在结果集中，其中未成功匹配的键将以空字符串形式填充
 * !匹配值已解码
 * @param keys 待匹配键集合
 * @returns 包含所有待匹配键及其对应值的集合
 */
export declare function FCookieMatcher<T extends string[]>(...keys: T): Map<T[number], string>;
/**
 * 请求头/响应头参数匹配器
 * *所有待匹配键都将包含在结果集中，其中未成功匹配的键将以空字符串形式填充
 * !匹配值已解码
 * @param headers 请求头/响应头
 * @param target 目标字段
 * @param keys 待匹配键集合
 * @returns 包含所有待匹配键及其对应值的集合
 */
export declare function FHeaderMatcher<T extends string[]>(headers: Headers, target: string, ...keys: T): Map<T[number], string>;
/**
 * 地址栏参数匹配器
 * *所有待匹配键都将包含在结果集中，其中未成功匹配的键将以空字符串形式填充
 * !匹配值已解码
 * @param keys 待匹配键集合
 * @returns 包含所有待匹配键及其对应值的集合
 */
export declare function FUrlMatcher<T extends string[]>(...keys: T): Map<T[number], string>;
