import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { FGetCookie, FGetSession } from '../token';
import { FGetAuthorization } from '@/utils';
import { TeMessageBox } from '@tiansu/element-plus';
import store from '../../store/index';

import { FORBIDDEN_CODES } from '../../config';

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
    if (error?.response?.data?.size) {
      checkBlobPermission(error?.response.data);
    } else {
      checkPermission(
        +error?.response?.data?.errcode || +error?.response?.data?.code,
        error?.response?.data?.message || error?.response?.data?.errmsg,
      );
    }
    throw error.message;
  },
);

function checkPermission(code: number, message: string) {
  if (FORBIDDEN_CODES?.includes(+code) && !store.getters.isTokenFailureFlag) {
    store.dispatch('setIsTokenFailureFlag', true);
    TeMessageBox.alert('登录信息已失效，请重新登录', '', {
      confirmButtonText: '确认',
      showClose: false,
      showCancelButton: false,
      type: 'warning',
    })
      .then(() => {
        window.location.href = message;
      })
      .catch(() => {
        console.warn('cancel');
      });
  }
}

function checkBlobPermission(blob: Blob) {
  if (blob.size && blob.type === 'application/json') {
    const reader = new FileReader();
    reader.onloadend = (e) => {
      const res = JSON.parse(e.target?.result as string);
      if (Number(res?.errcode) === 401 || res?.code === 401) {
        checkPermission(res?.code, res?.message);
      }
    };
    reader.readAsText(blob);
  }
}

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
  const Authorization = FGetAuthorization();
  config.headers!.Authorization = Authorization;

  const tenant = {
    tenantId: FGetSession('TENANT_ID'),
    tenantCode: FGetSession('TENANT_CODE'),
  };
  if (tenant.tenantId && tenant.tenantCode) {
    switch (Object.prototype.toString.call(config.data).slice(8, -1).toLocaleLowerCase()) {
      case 'undefined':
      case 'null':
      case 'object':
        config.data = { ...config.data, ...tenant };
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

window.addEventListener('message', (e) => {
  if (e?.data?.type === 'toc-login-failure') {
    checkPermission(e?.data?.code, e?.data?.message);
  }
});
