import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { FGetCookie, FGetSession } from '../token';
import { FGetAuthorization } from '@/utils';
const REQ_LIST = new Map<string, AbortController>();

/**
 * 请求拦截器
 */
axios.interceptors.request.use(
  (config) => {
    try {
      addAbortController(config);

      addPrefix(config);
      addToken(config);
      return config;
    } catch (error) {
      throw error;
    }
  },
  (error) => {
    throw error.message;
  },
);

/**
 * 响应拦截器
 */
axios.interceptors.response.use(
  (res) => {
    try {
      // 回收中断控制器
      res.config.url && REQ_LIST.delete(res.config.url);

      checkStatus(res);
      return res.data;
    } catch (error) {
      throw error;
    }
  },
  (error) => {
    throw error.message;
  },
);

/**
 * 添加请求前缀
 * @param config 请求配置参数
 */
function addPrefix(config: AxiosRequestConfig): void {
  config.baseURL = import.meta.env.VITE_BASE_URL as string;
}

/**
 * 添加租户信息
 * @param config 请求配置参数
 */
function addToken(config: AxiosRequestConfig): void {
  const token = FGetCookie('toc-token');
  token && (config.headers!.token = token);
  const username = FGetCookie('username');
  username && (config.headers!.username = username);
  const tocTenantId = FGetCookie('toc_tenant_id');
  tocTenantId && (config.headers!.tocTenantId = tocTenantId);
  config.headers!.Authorization = FGetAuthorization();

  const tenant = {
    tenantId: FGetSession('TENANT_ID'),
    tenantCode: FGetSession('TENANT_CODE'),
  };
  if (tenant.tenantId && tenant.tenantCode) {
    switch (Object.prototype.toString.call(config.data).slice(8, -1).toLocaleLowerCase()) {
      case 'undefined':
      case 'null':
      case 'object':
        config.data = { ...tenant, ...config.data };
        break;
      case 'blob':
        Object.entries(tenant).forEach(([k, v]) => (config.data as FormData).append(k, v!));
        break;
      default:
        break;
    }
  }
}

/**
 * 添加中断控制器
 * !未完成的重复请求将被中止
 * @param config 请求配置参数
 */
function addAbortController(config: AxiosRequestConfig): void {
  if (!config.url) {
    return;
  }

  // 中止现存的重复请求
  REQ_LIST.get(config.url)?.abort();

  const controller = new AbortController();
  REQ_LIST.set(config.url, controller);
  config.signal = controller.signal;
}

/**
 * 校验状态码
 * @param res 响应
 * @throws 非法状态码将抛出状态信息
 */
function checkStatus(res: AxiosResponse): void {
  switch (res.status) {
    case 200:
      break;
    default:
      throw res.statusText;
  }
}
