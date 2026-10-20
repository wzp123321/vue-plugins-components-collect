/**
 * 错误提示消息工具
 */
/* eslint-disable max-classes-per-file */
import type { AxiosError, AxiosResponse } from 'axios';
import type {
  ResponseInterceptorConfig,
  ResponseData,
  RequestConfig,
} from '../type';

/**
 * 错误提示消息防抖管理器
 * "前置防抖"，首次错误立即显示，后续被抑制
 */
export class ErrorDebounceManager {
  private timer: number | null = null;

  private wait: number;

  constructor(wait: number) {
    if (!wait) {
      throw new Error('错误防抖时间不能为空');
    }
    this.wait = wait;
  }

  /**
   * 防抖处理错误消息
   */
  debounce(showErrorMessage?: () => void): void {
    if (!showErrorMessage) return;

    if (this.timer) {
      clearTimeout(this.timer);
    }

    const callNow = !this.timer;
    this.timer = window.setTimeout(() => {
      this.timer = null;
    }, this.wait);

    if (callNow) {
      showErrorMessage();
    }
  }

  /**
   * 清除定时器
   */
  clear(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

/**
 * 错误提示消息防抖管理器工厂
 * 确保相同 wait 时间的请求使用同一个防抖管理器实例
 */
export class ErrorDebounceManagerFactory {
  private static managers: Map<number, ErrorDebounceManager> = new Map();

  /**
   * 获取指定 wait 时间的防抖管理器实例
   * @param wait 防抖等待时间（毫秒）
   * @returns 防抖管理器实例
   */
  static getManager(wait: number): ErrorDebounceManager {
    if (!this.managers.has(wait)) {
      this.managers.set(wait, new ErrorDebounceManager(wait));
    }
    return this.managers.get(wait) as ErrorDebounceManager;
  }

  /**
   * 清除指定 wait 时间的防抖管理器
   * @param wait 防抖等待时间（毫秒）
   */
  static clearManager(wait: number): void {
    const manager = this.managers.get(wait);
    if (manager) {
      manager.clear();
      this.managers.delete(wait);
    }
  }

  /**
   * 清除所有防抖管理器
   */
  static clearAll(): void {
    this.managers.forEach((manager) => manager.clear());
    this.managers.clear();
  }
}

/**
 * 提取错误消息
 */
export function extractErrorMessage(
  response?: AxiosResponse<ResponseData, any>,
  error?: AxiosError,
): string {
  if (response?.data) {
    const data = response.data;
    return (
      data.message || data.msg || data.errmsg || data.error || '接口响应异常'
    );
  }
  return error?.message || '请求失败，请稍后重试';
}

/**
 * 统一处理错误提示
 * 当 errorDebounceWait 有值时，进行防抖处理
 * @param errMsg 错误消息
 * @param config 响应拦截器配置
 * @param type 消息类型，默认为 'error'
 */
export function showErrorMessage(
  errMsg: string,
  config: ResponseInterceptorConfig,
  response?: AxiosResponse<ResponseData, any>,
  error?: AxiosError<ResponseData, any>,
): void {
  const requestConfig = response?.config as unknown as RequestConfig;
  if (!config.showErrorMessage || requestConfig?.hiddenErrorMessage) return;
  // 如果配置了防抖时间，则使用防抖处理
  if (config.errorDebounceWait) {
    // 使用工厂获取共享的防抖管理器实例，确保防抖效果
    const debounceManager = ErrorDebounceManagerFactory.getManager(
      config.errorDebounceWait,
    );
    debounceManager.debounce(() =>
      config.showErrorMessage?.(errMsg, config, response, error),
    );
  } else {
    // 没有配置防抖时间，直接显示
    config.showErrorMessage(errMsg, config, response, error);
  }
}
