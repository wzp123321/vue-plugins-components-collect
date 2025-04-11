/**
 * 调用公共方法设置本地缓存数据
 * @param key
 * @param value
 */
export function FSetStorageData(key: string, value?: string): void {
  window.sessionStorage.setItem(key, encodeURIComponent(value ?? ''));
}
/**
 * 调用公共方法获取本地缓存数据
 * @param key
 * @returns
 */
export function FGetStorageData(key: string): string | null {
  return window.sessionStorage.getItem(key);
}
