/**
 * 缓存工具
 * 支持内存缓存、localStorage、sessionStorage 等多种存储方式
 */
/* eslint-disable max-classes-per-file */
import type { AxiosRequestConfig } from 'axios';
/**
 * 缓存存储类型
 */
export type CacheStorageType = 'memory' | 'localStorage' | 'sessionStorage';

/**
 * 缓存项接口
 */
interface CacheItem<T = any> {
  /** 缓存数据 */
  data: T;
  /** 过期时间戳 */
  expireTime: number;
  /** 创建时间戳 */
  createTime: number;
}

/**
 * 缓存配置
 */
export interface CacheConfig {
  /** 是否启用缓存 */
  enable?: boolean;
  /** 缓存存储类型 */
  storageType?: CacheStorageType;
  /** 缓存过期时间（毫秒），0 表示永不过期 */
  expireTime?: number;
  /** 缓存键生成函数 */
  keyGenerator?: (config: AxiosRequestConfig) => string;
  /** 是否强制刷新（忽略缓存） */
  forceRefresh?: boolean;
}

/**
 * 内存缓存管理器
 */
class MemoryCache {
  private cache: Map<string, CacheItem> = new Map();

  /**
   * 设置缓存
   */
  set<T>(key: string, value: T, expireTime: number): void {
    const now = Date.now();
    this.cache.set(key, {
      data: value,
      expireTime: expireTime > 0 ? now + expireTime : 0,
      createTime: now,
    });
  }

  /**
   * 获取缓存
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) {
      return null;
    }

    // 检查是否过期
    if (item.expireTime > 0 && Date.now() > item.expireTime) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  /**
   * 删除缓存
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 检查缓存是否存在且未过期
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) {
      return false;
    }

    // 检查是否过期
    if (item.expireTime > 0 && Date.now() > item.expireTime) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * 获取所有缓存键
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * 清理过期缓存
   */
  cleanExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    this.cache.forEach((item, key) => {
      if (item.expireTime > 0 && now > item.expireTime) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => {
      this.cache.delete(key);
    });
  }
}

/**
 * 缓存管理器基类
 */
abstract class BaseCacheStorage {
  abstract get<T>(key: string): T | null;

  abstract set<T>(key: string, value: T, expireTime: number): void;

  abstract delete(key: string): void;

  abstract clear(): void;

  abstract has(key: string): boolean;
}

/**
 * LocalStorage 缓存实现
 */
class LocalStorageCache extends BaseCacheStorage {
  private prefix = 'http_cache_';

  private getStorageKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  get<T>(key: string): T | null {
    try {
      const storageKey = this.getStorageKey(key);
      const itemStr = localStorage.getItem(storageKey);
      if (!itemStr) {
        return null;
      }

      const item: CacheItem<T> = JSON.parse(itemStr);

      // 检查是否过期
      if (item.expireTime > 0 && Date.now() > item.expireTime) {
        localStorage.removeItem(storageKey);
        return null;
      }

      return item.data;
    } catch (error) {
      console.error('LocalStorage 缓存读取失败:', error);
      return null;
    }
  }

  set<T>(key: string, value: T, expireTime: number): void {
    try {
      const now = Date.now();
      const item: CacheItem<T> = {
        data: value,
        expireTime: expireTime > 0 ? now + expireTime : 0,
        createTime: now,
      };
      const storageKey = this.getStorageKey(key);
      localStorage.setItem(storageKey, JSON.stringify(item));
    } catch (error) {
      console.error('LocalStorage 缓存写入失败:', error);
      // 如果存储空间不足，尝试清理过期缓存
      this.cleanExpired();
      try {
        const now = Date.now();
        const item: CacheItem<T> = {
          data: value,
          expireTime: expireTime > 0 ? now + expireTime : 0,
          createTime: now,
        };
        const storageKey = this.getStorageKey(key);
        localStorage.setItem(storageKey, JSON.stringify(item));
      } catch (retryError) {
        console.error('LocalStorage 缓存重试写入失败:', retryError);
      }
    }
  }

  delete(key: string): void {
    try {
      const storageKey = this.getStorageKey(key);
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('LocalStorage 缓存删除失败:', error);
    }
  }

  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('LocalStorage 缓存清空失败:', error);
    }
  }

  has(key: string): boolean {
    try {
      const storageKey = this.getStorageKey(key);
      const itemStr = localStorage.getItem(storageKey);
      if (!itemStr) {
        return false;
      }

      const item: CacheItem = JSON.parse(itemStr);

      // 检查是否过期
      if (item.expireTime > 0 && Date.now() > item.expireTime) {
        localStorage.removeItem(storageKey);
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * 清理过期缓存
   */
  cleanExpired(): void {
    try {
      const keys = Object.keys(localStorage);
      const now = Date.now();
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          try {
            const itemStr = localStorage.getItem(key);
            if (itemStr) {
              const item: CacheItem = JSON.parse(itemStr);
              if (item.expireTime > 0 && now > item.expireTime) {
                localStorage.removeItem(key);
              }
            }
          } catch {
            // 忽略解析错误，继续处理下一个
          }
        }
      });
    } catch (error) {
      console.error('清理过期缓存失败:', error);
    }
  }
}

/**
 * SessionStorage 缓存实现
 */
class SessionStorageCache extends BaseCacheStorage {
  private prefix = 'http_cache_';

  private getStorageKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  get<T>(key: string): T | null {
    try {
      const storageKey = this.getStorageKey(key);
      const itemStr = sessionStorage.getItem(storageKey);
      if (!itemStr) {
        return null;
      }

      const item: CacheItem<T> = JSON.parse(itemStr);

      // 检查是否过期
      if (item.expireTime > 0 && Date.now() > item.expireTime) {
        sessionStorage.removeItem(storageKey);
        return null;
      }

      return item.data;
    } catch (error) {
      console.error('SessionStorage 缓存读取失败:', error);
      return null;
    }
  }

  set<T>(key: string, value: T, expireTime: number): void {
    try {
      const now = Date.now();
      const item: CacheItem<T> = {
        data: value,
        expireTime: expireTime > 0 ? now + expireTime : 0,
        createTime: now,
      };
      const storageKey = this.getStorageKey(key);
      sessionStorage.setItem(storageKey, JSON.stringify(item));
    } catch (error) {
      console.error('SessionStorage 缓存写入失败:', error);
    }
  }

  delete(key: string): void {
    try {
      const storageKey = this.getStorageKey(key);
      sessionStorage.removeItem(storageKey);
    } catch (error) {
      console.error('SessionStorage 缓存删除失败:', error);
    }
  }

  clear(): void {
    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('SessionStorage 缓存清空失败:', error);
    }
  }

  has(key: string): boolean {
    try {
      const storageKey = this.getStorageKey(key);
      const itemStr = sessionStorage.getItem(storageKey);
      if (!itemStr) {
        return false;
      }

      const item: CacheItem = JSON.parse(itemStr);

      // 检查是否过期
      if (item.expireTime > 0 && Date.now() > item.expireTime) {
        sessionStorage.removeItem(storageKey);
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }
}

/**
 * 缓存管理器
 */
export class CacheManager {
  // 定时清理缓存的定时器句柄
  private cleanupTimer?: number;

  private memoryCache: MemoryCache;

  private localStorageCache: LocalStorageCache;

  private sessionStorageCache: SessionStorageCache;

  constructor() {
    this.memoryCache = new MemoryCache();
    this.localStorageCache = new LocalStorageCache();
    this.sessionStorageCache = new SessionStorageCache();

    // 定期清理过期缓存
    this.startCleanupTimer();
  }

  /**
   * 获取缓存存储实例
   */
  private getStorage(type: CacheStorageType): BaseCacheStorage {
    switch (type) {
      case 'localStorage':
        return this.localStorageCache;
      case 'sessionStorage':
        return this.sessionStorageCache;
      case 'memory':
      default:
        return this.memoryCache as unknown as BaseCacheStorage;
    }
  }

  /**
   * 获取缓存
   */
  get<T>(key: string, storageType: CacheStorageType = 'memory'): T | null {
    const storage = this.getStorage(storageType);
    return storage.get<T>(key);
  }

  /**
   * 设置缓存
   */
  set<T>(
    key: string,
    value: T,
    expireTime: number,
    storageType: CacheStorageType = 'memory',
  ): void {
    const storage = this.getStorage(storageType);
    storage.set(key, value, expireTime);
  }

  /**
   * 删除缓存
   */
  delete(key: string, storageType?: CacheStorageType): void {
    if (storageType) {
      const storage = this.getStorage(storageType);
      storage.delete(key);
    } else {
      // 删除所有存储类型中的缓存
      this.memoryCache.delete(key);
      this.localStorageCache.delete(key);
      this.sessionStorageCache.delete(key);
    }
  }

  /**
   * 清空所有缓存
   */
  clear(storageType?: CacheStorageType): void {
    if (storageType) {
      const storage = this.getStorage(storageType);
      storage.clear();
    } else {
      this.memoryCache.clear();
      this.localStorageCache.clear();
      this.sessionStorageCache.clear();
    }
  }

  /**
   * 检查缓存是否存在
   */
  has(key: string, storageType: CacheStorageType = 'memory'): boolean {
    const storage = this.getStorage(storageType);
    return storage.has(key);
  }

  /**
   * 生成缓存键
   * 规则：url + method + params + data json字符串
   */
  static generateKey(config: AxiosRequestConfig): string {
    const { url, method, params, data } = config;
    const parts = [method?.toUpperCase() || 'GET', url || ''];

    // 添加查询参数
    if (params) {
      const sortedParams = JSON.stringify(params, Object.keys(params).sort());
      parts.push(sortedParams);
    }

    // 添加请求体
    if (data) {
      const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
      parts.push(dataStr);
    }

    return parts.join('|');
  }

  /**
   * 启动清理定时器
   */
  private startCleanupTimer(): void {
    // 防止重复启动
    if (this.cleanupTimer != null) return;
    // 每 5 分钟清理一次过期缓存
    this.cleanupTimer = window.setInterval(
      () => {
        this.memoryCache.cleanExpired();
        this.localStorageCache.cleanExpired();
      },
      5 * 60 * 1000,
    );
  }

  /** 销毁定时器以避免内存泄漏 */
  destroy(): void {
    if (this.cleanupTimer !== undefined) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }
}

// 导出单例
export const cacheManager = new CacheManager();
