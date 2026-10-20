/**
 * 请求取消管理器
 * 基于 AbortController 实现请求取消功能
 * 用于管理请求的取消和重复请求的移除
 */
import type { AxiosRequestConfig } from 'axios';

/**
 * 待取消的请求项
 * 包含请求的URL、数据和 AbortController
 */
interface PendingItem {
  method?: string;
  url?: string;
  params?: any;
  data?: any;
  abortController: AbortController;
}

/**
 * 请求取消管理器
 * 基于 AbortController 实现
 */
class CancelTokenManager {
  private pending: PendingItem[] = [];

  private maxCount: number;

  constructor(maxCount: number) {
    this.maxCount = maxCount;
  }

  /**
   * 判断两条请求是否为同一请求
   */
  static isSameRequest(
    item: PendingItem,
    config: AxiosRequestConfig,
  ): boolean {
    const methodMatches = item.method === config.method;
    const urlMatches = item.url === config.url;
    const paramsMatches =
      JSON.stringify(item.params) === JSON.stringify(config.params);
    const dataMatches =
      JSON.stringify(item.data) === JSON.stringify(config.data);
    return methodMatches && urlMatches && paramsMatches && dataMatches;
  }

  /**
   * 添加待取消的请求
   */
  add(config: AxiosRequestConfig, abortController: AbortController): void {
    // 如果超过最大数量，清空数组
    if (this.pending.length > this.maxCount) {
      this.pending = [];
    }

    this.pending.push({
      method: config.method,
      url: config.url,
      params: config.params,
      data: config.data,
      abortController,
    });
  }

  /**
   * 检查是否是存在重复请求，返回重复请求的索引
   */
  isExistDuplicate(config: AxiosRequestConfig): number {
    return this.pending.findIndex((item) => CancelTokenManager.isSameRequest(item, config));
  }

  /**
   * 移除并取消重复的请求
   */
  remove(config: AxiosRequestConfig): void {
    const index = this.isExistDuplicate(config);

    if (index !== -1) {
      // 执行取消操作
      this.pending[index].abortController.abort();
      // 从数组中移除
      this.pending.splice(index, 1);
    }
  }

  /**
   * 清空所有待取消的请求
   */
  clearAll(): void {
    this.pending.forEach((item) => {
      if (!item.abortController.signal.aborted) {
        item.abortController.abort();
      }
    });
    this.pending = [];
  }

  /**
   * 获取所有待取消的请求
   */
  getAll(): PendingItem[] {
    return [...this.pending];
  }

  /**
   * 移除指定的请求（不取消）
   * 用于请求完成后的清理
   */
  removeItem(config: AxiosRequestConfig): void {
    const index = this.pending.findIndex((item) =>
      CancelTokenManager.isSameRequest(item, config),
    );

    if (index !== -1) {
      this.pending.splice(index, 1);
    }
  }
}

/**
 * 创建 AbortController 并配置到请求中
 * @param config Axios 请求配置
 * @param manager 取消令牌管理器
 * @param enableCancel 是否启用取消功能
 * @returns AbortController 或 undefined
 */
export function createAbortController(
  config: AxiosRequestConfig,
  manager: CancelTokenManager,
  enableCancel: boolean,
): AbortController | undefined {
  if (!enableCancel) {
    return undefined;
  }

  // 创建 AbortController
  const abortController = new AbortController();

  // 移除重复请求
  manager.remove(config);

  // 添加新请求
  manager.add(config, abortController);

  // 将 signal 设置到请求配置中
  config.signal = abortController.signal;

  return abortController;
}

export { CancelTokenManager };
export type { PendingItem };
