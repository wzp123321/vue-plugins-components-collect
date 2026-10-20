/**
 * 请求重试工具
 * 用于管理 HTTP 请求的重试逻辑
 */
import type { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import axios from 'axios';
import type { RequestConfig, HttpClientConfig } from '../../type';
import { HTTP_STATUS } from '../../constant';
import { mergeConfig, mergeRetryConfig } from '../configMerge';

/**
 * 延迟函数
 * @param ms 延迟时间（毫秒）
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * 判断错误是否应该重试
 * @param error Axios 错误对象
 * @param requestConfig 请求配置（局部配置）
 * @param httpClientConfig 全局配置
 * @returns 是否应该重试
 */
export function shouldRetry(
  error: AxiosError,
  requestConfig: RequestConfig,
  httpClientConfig: HttpClientConfig,
): boolean {
  // 如果请求被取消，不重试
  if (axios.isCancel(error)) {
    return false;
  }

  // 检查请求配置中的 retry 标志
  // 优先级：请求配置 retry.enable > 全局配置 retry.enable > 默认配置
  const retry = mergeConfig<boolean>({
    local: requestConfig.retry?.enable,
    global: httpClientConfig.retry?.enable,
  });

  // 如果明确设置为 false，则不重试
  if (retry === false) {
    return false;
  }

  // 如果没有响应（网络错误、超时等），可以重试
  const errorResponse = (error as AxiosError).response;
  if (!errorResponse) {
    // 网络错误（包括超时、连接失败等）都应该重试
    return true;
  }

  const status = errorResponse.status;

  // 5xx 服务器错误可以重试（除了某些特定错误）
  if (status >= 500) {
    // 501 和 505 不应该重试（服务器不支持）
    if (
      status === HTTP_STATUS.SERVER_ERROR.NotImplemented ||
      status === HTTP_STATUS.SERVER_ERROR.HttpVersionNotSupported
    ) {
      return false;
    }
    return true;
  }

  // 408 请求超时可以重试
  if (status === HTTP_STATUS.REQUEST_ERROR.RequestTimeout) {
    return true;
  }

  // 429 请求过多可以重试（虽然不在常量中，但常见）
  if (status === 429) {
    return true;
  }

  // 其他错误不重试
  return false;
}

/**
 * 获取重试配置
 * 使用统一的配置合并方法，优先级：请求配置 > 全局配置
 * @param requestConfig 请求配置（局部配置）
 * @param httpClientConfig 全局配置
 * @returns 重试配置（重试次数和重试延迟）
 */
export function getRetryConfig(
  requestConfig: RequestConfig,
  httpClientConfig: HttpClientConfig,
): { retryCount: number; retryDelay: number } {
  return mergeRetryConfig(requestConfig, httpClientConfig);
}

/**
 * 执行请求重试
 * @param error 原始错误
 * @param requestConfig 请求配置（包含重试相关信息）
 * @param httpClientConfig 全局配置
 * @param axiosInstance Axios 实例
 * @returns 重试后的响应，如果重试次数已用完则返回 null
 */
export async function executeRetry(
  error: AxiosError,
  requestConfig: RequestConfig & { retryCountAttempt?: number },
  httpClientConfig: HttpClientConfig,
  axiosInstance: AxiosInstance,
): Promise<AxiosResponse | null> {
  // 获取当前重试次数（从请求配置中获取，如果没有则初始化为 0）
  const currentRetryCount = requestConfig.retryCountAttempt ?? 0;
  const { retryCount, retryDelay } = getRetryConfig(
    requestConfig,
    httpClientConfig,
  );

  // 如果还有重试次数
  if (typeof retryCount === "number" && currentRetryCount < retryCount) {
    // 增加重试次数
    requestConfig.retryCountAttempt = currentRetryCount + 1;

    // 等待重试延迟时间
    await delay(retryDelay);

    // 创建一个新的配置对象，避免修改原始配置
    const retryConfig = {
      ...error.config,
      retryCountAttempt: requestConfig.retryCountAttempt,
    };

    // 重新发送请求
    return axiosInstance.request(retryConfig);
  }

  // 重试次数已用完，返回 null 表示不再重试
  return null;
}
