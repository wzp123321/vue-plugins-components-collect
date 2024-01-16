/*
 * @Author: wanzp
 * @Date: 2022-11-10 15:24:12
 * @LastEditors: wanzp
 * @LastEditTime: 2023-06-28 11:09:47
 * @Description: Description
 */

/**
 * 获取地址参数项
 * @param key 参数名
 * @returns 参数名对应的值
 */
export function FGetCookie(key: string): string | undefined {
  const reg = new RegExp(`(^| )${key}=([^;]*)(;|$)`, 'i');
  const match = document.cookie.match(reg) ?? '';
  if (match.length > 2) {
    return decodeURIComponent(match[2]);
  }
}

// 存入cookie
export function FSetCookie(key: string, value?: string): void {
  if (!key) {
    return;
  }

  // 先置空
  document.cookie = `${key.toLowerCase()}=${encodeURIComponent('')};path=/`;
  document.cookie = `${key.toLowerCase()}=${encodeURIComponent(value ?? '')};path=/`;
}

export const isJsonString = (str: string) => {
  try {
    if (str !== null && typeof JSON.parse(str) == 'object') {
      return true;
    }
  } catch (e) {}
  return false;
};
