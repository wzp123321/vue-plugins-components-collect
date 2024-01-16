import { FGetQueryParam, FGetSession, FSetSession } from '@/core/token';
import cryptoUtil from '@/utils/crypto';

/**
 * 页面跳转
 * @param tag 目标页面标记
 */
export function TH_FOpenTag(tag: string): void {
  if (!tag) {
    return;
  }

  const params = {
    tenantId: cryptoUtil.Encrypt(FGetSession('tenant_id') ?? ''),
    tenantCode: cryptoUtil.Encrypt(FGetSession('tenant_code') ?? ''),
  };
  // 组装参数项
  const query = Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');

  window.open(`${import.meta.env.VITE_CONTAINER_PROXY_URL}${tag}?${query}`, '_blank');
}
