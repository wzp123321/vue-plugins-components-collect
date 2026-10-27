/**
 * 调用公共方法设置本地缓存数据
 * @param key
 * @param value
 */
export const FSetStorageData = (key: string, value?: string): void => {
  window.sessionStorage.setItem(key, encodeURIComponent(value ?? ''));
}
/**
 * 调用公共方法获取本地缓存数据
 * @param key
 * @returns
 */
export const FGetStorageData = (key: string): string | null => window.sessionStorage.getItem(key);
