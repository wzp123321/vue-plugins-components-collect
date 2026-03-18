import { createStorage, USER_TOKEN_KEY,TENANT_INFO_KEY } from '@tiansu/tools';

export const namespace = import.meta.env.VITE_APP_ID || 'sec-web';
/**
 * 创建localStorage
 */
export const LocalStorage = createStorage('localStorage', namespace);

/**
 * 创建sessionStorage
 */
export const SessionStorage = createStorage('sessionStorage', namespace);

/**
 * 获取全局token
 */
export const getPlatformToken = () => LocalStorage.getItem(USER_TOKEN_KEY);


// 获取租户信息

export const getPlatformTenant = () => LocalStorage.getItem(TENANT_INFO_KEY);
