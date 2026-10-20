/**
 * 设置本地缓存数据
 * @param key 键
 * @param value 值
 * @returns void
 */
export declare function setStorageData(key: string, value: string): void;
/**
 * 通过key取本地缓存数据
 * @param key 键
 * @returns 值
 */
export declare function getStorageData(key: string): string | undefined;
/**
 * 通过键清除缓存，不传参代表全量清除
 * @param keys
 * @returns void
 */
export declare function batchRemoveStorageData(keys?: string[]): void;
