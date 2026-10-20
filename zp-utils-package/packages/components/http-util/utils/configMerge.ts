/**
 * 配置合并工具
 * 用于处理全局配置和局部配置的优先级合并
 */
import type { RequestConfig, HttpClientConfig } from '../type';
import { isNil, mergeWith } from 'lodash-es';

/**
 * 配置合并选项
 */
interface ConfigMergeOptions<T> {
  /** 局部配置值 */
  local?: T;
  /** 全局配置值 */
  global?: T;
}

/**
 * 简单的通用配置合并函数
 * 优先级：局部配置 > 全局配置
 *
 * @param options 配置合并选项 { local: 局部配置, global: 全局配置 }
 * @returns 合并后的配置值
 */
export function mergeConfig<T>(options: ConfigMergeOptions<T>): T {
  const { local, global } = options;

  // 优先级：局部 > 全局
  // 使用 isNil 判断 null、undefined 等忽略的值
  if (!isNil(local)) {
    return local as T;
  }

  return global as T;
}

/**
 * 数据合并器--按优先级合并配置，基于lodash的mergeWith，深度递归合并。
 * @param global 全局配置
 * @param local 局部配置
 * PS ''--是有意义的，null、undefined视为未做配置
 */
export const mergeConfigWithPriority = (
  global: Record<string, any> | undefined,
  local: Record<string, any> | undefined,
): Record<string, any> | undefined => {
  // 如果两者都不存在，返回 undefined
  if (isNil(global) && isNil(local)) {
    return undefined;
  }
  // 如果只有局部配置，返回局部配置
  if (isNil(global) && !isNil(local)) {
    return local;
  }
  // 如果只有全局配置，返回全局配置
  if (!isNil(global) && isNil(local)) {
    return global;
  }

  // 两者都存在，进行合并
  // 使用空对象作为合并目标，global 和 local 都作为来源
  // 不需要 cloneDeep，mergeWith 的合并结果是新对象，不会影响原始 global
  const customizer = (objValue: unknown, srcValue: unknown) => {
    // 数组直接覆盖，不合并
    if (Array.isArray(srcValue)) {
      return srcValue;
    }
    // 如果来源值为 nil，保留目标值
    if (isNil(srcValue)) {
      return objValue;
    }
    // 其他情况使用默认合并逻辑
    return undefined;
  };

  // 先把 global 合并到空对象，再把 local 合并进去（local 优先级高）
  const result = mergeWith({}, global, customizer);
  return mergeWith(result, local, customizer);
};

/**
 * 只涉及重试配置的合并（仅用于响应拦截器）
 *
 * @param requestConfig 请求配置（局部配置）
 * @param httpClientConfig 全局配置
 * @returns 合并后的重试配置
 */
export function mergeRetryConfig(
  requestConfig: RequestConfig,
  httpClientConfig: HttpClientConfig,
): {
  retryCount: number;
  retryDelay: number;
} {
  // 合并 retryCount
  // 优先级：请求配置 retry.count > 全局配置 retry.count > 默认配置
  const retryCount = mergeConfig<number>({
    local: requestConfig.retry?.count,
    global: httpClientConfig.retry?.count,
  });

  // 合并 retryDelay
  // 优先级：请求配置 retry.delay > 全局配置 retry.delay > 默认配置
  const retryDelay = mergeConfig<number>({
    local: requestConfig.retry?.delay,
    global: httpClientConfig.retry?.delay,
  });

  return {
    retryCount,
    retryDelay,
  };
}
