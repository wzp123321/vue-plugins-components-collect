// http请求全局配置、请求、响应拦截
import Request, { type HttpRequestConfig, type HttpCustom, type HttpResponse } from 'luch-request';
// 配置
import {
  SESSION_KEY_LOGIN_NAME,
  SESSION_KEY_TOKEN,
  SESSION_KEY_TENANT_CODE,
  SESSION_KEY_USER_ID,
} from '@/config/session-key';
import { baseURL } from '@/config/request';
// 工具方法
import { FGetStorageData } from '@/utils/storage';
import { FGetAuthorization } from '@/utils/authorization';
// 接口
import type { Common_IHttpResponseImpl, Common_IObject } from './model';

// 节流接口列表
const throttleMap = new Map<string, Promise<any>>();

const http = new Request();
http.setConfig((config) => {
  /* 设置全局配置 */
  config.baseURL = baseURL;
  return config;
});

// 请求之前拦截器。可以使用async await 做异步操作
http.interceptors.request.use(
  async (config) => {
    addHeader(config);
    return config;
  },
  (config) => {
    return Promise.reject(config);
  },
);
// 添加请求头信息
const addHeader = (config: any) => {
  // token
  const token = FGetStorageData(SESSION_KEY_TOKEN);
  token && (config.header!.token = token);
  // loginName
  const loginName = FGetStorageData(SESSION_KEY_LOGIN_NAME);
  loginName && (config.header!.loginName = loginName);
  // userId
  const userId = FGetStorageData(SESSION_KEY_USER_ID);
  userId && (config.header!.userId = userId);
  // tenantCode
  const tenantCode = FGetStorageData(SESSION_KEY_TENANT_CODE);
  tenantCode && (config.header!.tenantCode = tenantCode);
  // 重放加密串
  const Authorization = FGetAuthorization();
  Authorization && (config.header!.Authorization = Authorization);
  return config;
};

// /* 响应之后拦截器。可以使用async await 做异步操作  */
http.interceptors.response.use(
  async (response) => {
    throttleMap.delete(response?.config?.url as string);
    // errcode转为code
    return response?.data?.size
      ? response?.data
      : {
          code: Number(response.data?.errcode) || response.data?.code,
          message: response.data?.errmsg || response.data?.message,
          data: response.data?.data,
          success: response.data?.success,
        };
  },
  (response) => {
    // 请求错误做点什么。可以使用async await 做异步操作
    throw response?.data;
  },
);

const commonHttp = {
  post<P, T>(url: string, params?: P, options?: HttpRequestConfig<HttpCustom>): Promise<Common_IHttpResponseImpl<T>> {
    // 如果需要做节流处理
    // if (!options?.custom!.throttleFlag || (options?.custom?.throttleFlag && !throttleMap.has(url))) {
    const res: Promise<Common_IHttpResponseImpl<T>> = http.post(url, params as any, options);
    throttleMap.set(url, res);
    return res;
    // }
  },
};

export { commonHttp };
