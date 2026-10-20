/**
 * 设置本地缓存数据
 * @param key 键
 * @param value 值
 * @returns void
 */
export function setStorageData(key: string, value: string): void {
  if (!key) {
    return;
  }
  window.sessionStorage.setItem(key, encodeURIComponent(value ?? ''));
}
/**
 * 通过key取本地缓存数据
 * @param key 键
 * @returns 值
 */
export function getStorageData(key: string): string | undefined {
  const value = window.sessionStorage.getItem(key);
  if (value) {
    return decodeURIComponent(value);
  }
}
/**
 * 通过键清除缓存，不传参代表全量清除
 * @param keys
 * @returns void
 */
export function batchRemoveStorageData(keys?: string[]): void {
  if (!keys || !keys?.length) {
    window.sessionStorage.clear();
  } else {
    keys?.forEach((key) => {
      window.sessionStorage.removeItem(key);
    });
  }
}
