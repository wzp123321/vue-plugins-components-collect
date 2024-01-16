import { FGetQueryParam, FGetAuthorization, getTenant } from '@/utils/index';
/*eslint-disable*/
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import ServiceConfig from '@/config/service';
import { FGetCookie } from '@/core/token';
import store from '../store/index';
import { FORBIDDEN_CODES } from '@/config/index';
import { ElMessageBox } from 'element-plus';

/**
 * 请求拦截器
 */
axios.interceptors.request.use(
  (config) => {
    try {
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
  const tenant = getTenant();
  config.headers!.tenantCode = tenant?.tenantCode;
  config.headers!.contentType =
    Object.prototype.toString.call(config?.data) === '[object String]'
      ? 'application/json; charset=utf-8'
      : 'application/json';
}

axios.interceptors.response.use(
  (res) => {
    if (res?.data?.size) {
      checkBlobPermission(res?.data);
    } else {
      checkAxiosPermission(+(res.data.code || res.data.errcode), res.data.message || res.data.errmsg);
    }
    return res;
  },
  (error) => {
    if (error?.response?.data?.size) {
      checkBlobPermission(error?.response.data);
    } else {
      checkAxiosPermission(
        +error?.response?.data?.errcode || +error?.response?.data?.code,
        error?.response?.data?.message || error?.response?.data?.errmsg,
      );
    }
    throw error.response;
  },
);

// 创建axios实例
const axiosInstance = () => {
  const instance = axios.create({
    baseURL: ServiceConfig.BASE_URL,
    timeout: ServiceConfig.TIME_OUT,
  });
  instance.interceptors.response.use(
    (res) => {
      if (res?.data?.size) {
        checkBlobPermission(res?.data);
      } else {
        checkAxiosPermission(+(res.data.code || res.data.errcode), res.data.message || res.data.errmsg);
      }
      return res;
    },
    (error) => {
      if (error?.response?.data?.size) {
        checkBlobPermission(error?.response.data);
      } else {
        checkAxiosPermission(
          +error?.response?.data?.errcode || +error?.response?.data?.code,
          error?.response?.data?.message || error?.response?.data?.errmsg,
        );
      }
      throw error.response;
    },
  );
  return instance;
};

export function checkAxiosPermission(code: number, message: string) {
  if (FORBIDDEN_CODES?.includes(+code) && !store.getters.isTokenFailureFlag) {
    store.dispatch('setIsTokenFailureFlag', true);
    if (mapIsInContainer()) {
      window.parent.postMessage(
        {
          code,
          message,
          type: 'toc-login-failure',
        },
        window.location.origin,
      );
      console.log({
        code,
        message,
        type: 'toc-login-failure',
      });
    } else {
      ElMessageBox.alert('登录信息已失效，请重新登录', '', {
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
}

function checkBlobPermission(blob: Blob) {
  if (blob.size && blob.type === 'application/json') {
    const reader = new FileReader();
    reader.onloadend = (e) => {
      const res = JSON.parse(e.target?.result as string);
      if (FORBIDDEN_CODES?.includes(Number(res?.errcode)) || FORBIDDEN_CODES?.includes(res?.code)) {
        checkAxiosPermission(res?.code || res?.errcode, res?.message || res?.errmsg);
      }
    };
    reader.readAsText(blob);
  }
}

function mapIsInContainer() {
  return !window.location.href?.includes('/home/');
}

// 请求实例
const publicReq = async (params: { [key: string]: any }) => {
  const { url, method, param, options } = params;
  const instance = axiosInstance();

  return await instance({
    url,
    method,
    ...options,
    // 在请求头里面添加token 如果没有则为空字符串
    headers: {
      token: FGetCookie('toc-token') ?? '',
      tocTenantId: FGetCookie('toc_tenant_id') ?? 540,
      username: FGetCookie('username') ?? '',
      tenantCode: getTenant().tenantCode,
      'Content-Type':
        Object.prototype.toString.call(param) === '[object String]'
          ? 'application/json; charset=utf-8'
          : 'application/json',
      Authorization: FGetAuthorization(),
    },
    [method === 'post' ? 'data' : 'params']: param || {},
  }).then((res: AxiosResponse) => {
    if (res) {
      let newRes: { [key: string]: any } = {};
      if (res?.data?.size) {
        newRes = res?.data;
      } else {
        newRes = {
          code: Number(res.data.code || res.data.errcode)
            ? Number(res.data.code || res.data.errcode)
            : res.data.code || res.data.errcode,
          message: res.data.message || res.data.errmsg || res?.data?.errmsg,
          data: res?.data?.data,
          success: res?.data?.success,
        };
      }
      if (newRes.code === 403) {
        window.location.href = ServiceConfig.PUBLIC_PATH;
        localStorage.clear();
        throw new Error(res.statusText);
      } else if (newRes.code !== 200) {
        const name = window.decodeURI(res.headers['content-disposition']?.split('=')[1] ?? '');
        if (name) {
          newRes['name'] = name;
          res.data[Symbol('name')] = name;
        }
        return newRes;
      } else {
        return newRes;
      }
    }
  });
};

// 单个请求 存在请求超时
export async function req(params: { [key: string]: any }, delay = ServiceConfig.TIME_OUT) {
  try {
    const response: any = await publicReq(params);
    if (response.data && response.data.code === 401) {
      location.href = '/';
    }
    return response;
  } catch (error) {
    throw error;
  }
}

// GET request
export async function getRequest(url: string, param?: { [key: string]: any }) {
  try {
    const response = await req({
      url,
      method: 'get',
      param,
    });
    return response;
  } catch (err) {
    throw err;
  }
}

// POST request
export async function postRequest(
  url: string,
  param?: { [key: string]: any } | number | string,
  options?: { [key: string]: string },
) {
  try {
    const response = await req({
      url,
      method: 'post',
      param,
      options,
    });
    return response;
  } catch (err) {
    throw err;
  }
}
