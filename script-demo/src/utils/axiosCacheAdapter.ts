import axios, { InternalAxiosRequestConfig } from "axios";
import { omit } from "lodash-es";

type CusConfigType = InternalAxiosRequestConfig & {
  cache?: boolean
}
// 缓存存储层
const MemoryCache = {
  data: new Map(),
  set(key: string, value: any, maxAge?: number) {
    this.data.set(key, {
      maxAge: maxAge || 0,
      value,
      now: Date.now(),
    })
  },
  get(key: string) {
    const cachedItem = this.data.get(key);
    if (!cachedItem) return null;
    const isExpired = Date.now() - cachedItem.now > cachedItem.maxAge && cachedItem.maxAge > 0;
    if (isExpired) {
      this.delete(key);
    }
    return isExpired ? null : cachedItem.value;
  },
  delete(key: string) { // 从缓存中删除指定 key 对应的值。
    this.data.delete(key);
  },
  clear() { // 清空已缓存的数据。
    this.data.clear();
  },
};

// 生成缓存key
function generateReqKey(config: CusConfigType) {
  const { method, url, params, data } = config;
  return `${method}_${url}_${params}_${data}`
}

// axios自定义适配器,用于处理缓存逻辑
export const cacheAdapterEnhancer = (CusConfig: CusConfigType) => {
  const isCache = CusConfig.cache
  const adapter = axios.getAdapter('xhr')
  const config = omit(CusConfig, 'cache')
  if (isCache) {
    const requestKey = generateReqKey(config);
    let responsePromise = MemoryCache.get(requestKey);
    if (!responsePromise) {
      responsePromise = (async () => {
        try {
          return await adapter(config);
        } catch (reason) {
          MemoryCache.delete(requestKey);
          throw reason;
        }
      })();
      MemoryCache.set(requestKey, responsePromise);
      return responsePromise;
    }
    return responsePromise;
  }
  return adapter(config);
};

