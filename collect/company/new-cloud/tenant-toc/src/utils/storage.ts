import { setStorageData, getStorageData, batchRemoveStorageData } from '@tiansu/tools';

/**
 * 调用公共方法设置本地缓存数据
 * @param key
 * @param value
 */
export function FSetStorageData(key: string, value?: string): void {
  setStorageData(key, value);
}
/**
 * 调用公共方法获取本地缓存数据
 * @param key
 * @returns
 */
export function FGetStorageData(key: string): string | undefined {
  return getStorageData(key);
}
/**
 * 批量删除缓存
 * @param keys
 */
export function FBatchRemoveStorageData(keys?: string[]): void {
  batchRemoveStorageData(keys);
}
