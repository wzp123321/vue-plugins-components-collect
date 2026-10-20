/**
 * 数据加解密管理
 * 封装业务层面的加解密逻辑，供请求/响应拦截器调用
 */
import { SM4Tool } from '../../../shang-mi/sm4-tool';
import type { EncryptConfig } from '../../type';

/**
 * 加密请求数据
 * 将请求体转为字符串后使用 SM4 加密
 */
export function encryptRequestData(data: any, key: string): string {
  const dataString =
    typeof data === 'string' ? data : JSON.stringify(data);
  return SM4Tool.encrypt(dataString, key);
}

/**
 * 解密响应数据
 * 使用 SM4 解密后尝试解析为 JSON，失败则返回原始字符串
 */
export function decryptResponseData(encryptedData: string, key: string): any {
  const decryptedData = SM4Tool.decrypt(encryptedData, key);
  try {
    return JSON.parse(decryptedData);
  } catch {
    return decryptedData;
  }
}

/**
 * 处理请求数据加密
 * 当启用加密且提供密钥时，加密请求数据并更新 config
 */
export function handleRequestEncrypt(
  data: any,
  encryptConfig: EncryptConfig | undefined,
): { encrypted: string; success: boolean } | null {
  // 如果未启用加密或未提供密钥或数据为空，则返回 null
  if (!encryptConfig?.enable || !encryptConfig?.key || data == null) {
    return null;
  }

  try {
    const encryptedData = encryptRequestData(data, encryptConfig.key);
    return { encrypted: encryptedData, success: true };
  } catch (error) {
    console.error('请求数据加密失败:', error);
    return { encrypted: '', success: false };
  }
}

/**
 * 处理响应数据解密
 * 当响应为加密字符串时，解密并解析
 */
export function handleResponseDecrypt(
  data: unknown,
  encryptConfig: EncryptConfig | undefined,
): { decrypted: any; success: boolean } | null {
  // 如果未启用加密或未提供密钥，则返回 null
  if (!encryptConfig?.enable || !encryptConfig?.key) {
    console.warn('响应数据解密失败: 未启用加密或未提供密钥');
    return null;
  }

  if (typeof data !== 'string') {
    return null;
  }

  try {
    const decryptedData = decryptResponseData(data, encryptConfig.key);
    return { decrypted: decryptedData, success: true };
  } catch (error) {
    console.error('响应数据解密失败:', error);
    return { decrypted: data, success: false };
  }
}
