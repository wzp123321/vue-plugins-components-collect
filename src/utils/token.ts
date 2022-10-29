/**
 * 获取地址参数项
 * @param key 参数名
 * @returns 参数名对应的值
 */
export function FGetQueryParam(key: string): string | undefined {
  const reg = new RegExp(`(^|&)${key}=([^&]*)(&|$)`, 'i')
  const match = window.location.search.substring(1).match(reg) ?? ''
  if (match.length > 2) {
    return decodeURIComponent(match[2])
  }
}

/**
 * 拼接地址栏参数
 * @param params
 * @returns
 */
export function FSetQueryParamStr(params: { [key: string]: string }) {
  return Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&')
}

export function FSetCookie(key: string, value?: string): void {
  if (!key) {
    return
  }

  document.cookie = `${key.toLowerCase()}=${encodeURIComponent(
    value ?? ''
  )};path=/`
}

export function FGetCookie(key: string): string | undefined {
  const reg = new RegExp(`(^| )${key}=([^;]*)(;|$)`, 'i')
  const match = document.cookie.match(reg) ?? ''
  if (match.length > 2) {
    return decodeURIComponent(match[2])
  }
}

/**
 * 清除cookie
 * @param cname
 */
export function clearCookie(cname: string) {
  const exdays = -1
  const d = new Date()
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000)
  const expires = 'expires=' + d.toUTCString()
  document.cookie = cname.toLowerCase() + '=' + '' + '; ' + expires
}

export function FSetSession(key: string, value?: string): void {
  if (!key) {
    return
  }

  sessionStorage.setItem(key.toLowerCase(), encodeURIComponent(value ?? ''))
}

export function FGetSession(key: string): string | undefined {
  const value = sessionStorage.getItem(key.toLowerCase())
  if (value) {
    return decodeURIComponent(value)
  }
}
