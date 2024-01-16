/**
 * 获取地址参数项
 * @param key 参数名
 * @returns 参数名对应的值
 */
export function FGetQueryParam(key: string): string | undefined {
  const reg = new RegExp(`(^|&)${key}=([^&]*)(&|$)`, 'i');
  const match = window.location.search.substring(1).match(reg) ?? '';
  if (match.length > 2) {
    return decodeURIComponent(match[2]);
  }
}

export function FSetCookie(key: string, value?: string): void {
  if (!key || !value) {
    return;
  }

  document.cookie = `${key.toLowerCase()}=${encodeURIComponent(value)};path=/`;
}
export function FGetCookie(key: string): string | undefined {
  const reg = new RegExp(`(^| )${key}=([^;]*)(;|$)`, 'i');
  const match = document.cookie.match(reg) ?? '';
  if (match.length > 2) {
    return decodeURIComponent(match[2]);
  }
}

export function FSetSession(key: string, value?: string): void {
  if (!key || !value) {
    return;
  }

  sessionStorage.setItem(key.toLowerCase(), encodeURIComponent(value));
}
export function FGetSession(key: string): string | undefined {
  const value = sessionStorage.getItem(key.toLowerCase());
  if (value) {
    return decodeURIComponent(value);
  }
}
