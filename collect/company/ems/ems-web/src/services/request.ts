/*eslint-disable*/
import axios, { AxiosResponse } from 'axios';
import { FGetAuthorization, FGetStorageData } from '@/utils/token';
import ServiceConfig from '@/config/request';
import { ElMessageBox } from 'element-plus';

let messageBoxFlag = false;

axios.interceptors.request.use(
  (config) => {
    try {
      config.timeout = ServiceConfig.TIME_OUT;
      return config;
    } catch (error) {
      throw error;
    }
  },
  (error) => {
    throw error;
  },
);
// 创建axios实例
const axiosInstance = () => {
  const instance = axios.create({
    baseURL: ServiceConfig.BASE_URL,
    timeout: ServiceConfig.TIME_OUT,
  });
  return instance;
};

// 请求实例
const publicReq = async (params: { [key: string]: any }) => {
  const { url, method, param } = params;
  const instance = axiosInstance();
  return await instance({
    url,
    method,
    // 在请求头里面添加token 如果没有则为空字符串
    headers: {
      'Content-Type':
        Object.prototype.toString.call(param) === '[object String]'
          ? 'application/json; charset=utf-8'
          : 'application/json',
      tenantCode: FGetStorageData('energy-corpid') ?? '',
      token: FGetStorageData('energy-token') ?? '',
      loginName: FGetStorageData('energy-loginName') ?? '',
      sourceValue: FGetStorageData('ems-sourceValue') ?? '',
      Authorization: FGetAuthorization(),
    },
    [method === 'post' ? 'data' : 'params']: param,
  })
    .then((res: AxiosResponse) => {
      if (res) {
        if (Number(res.data?.errcode) === 404 || res.data?.code === 404) {
          return {
            code: Number(res.data?.errcode) || res.data?.code,
            message: res.data?.errmsg || res.data?.message,
            data: res.data?.data,
            success: res.data?.success,
          };
        }
        if (Number(res.data?.errcode) === 401 || res.data?.code === 401) {
          console.log(Number(res.data?.errcode) === 401, res.data?.code === 401);
          const messageIns = document.getElementsByClassName('el-message');
          if (messageIns?.length && messageIns?.[0]) {
            (messageIns[0] as HTMLElement).style.display = 'none';
          }
          // 如果存在字段sourceValue 点击跳转登录页
          if (FGetStorageData('ems-sourceValue')) {
            if (messageBoxFlag) {
              return;
            }
            messageBoxFlag = true;
            ElMessageBox.confirm('登录信息已失效，请重新登录', {
              confirmButtonText: '确认',
              cancelButtonText: '取消',
              type: 'warning',
              showCancelButton: false,
              showClose: false,
              closeOnClickModal: false,
            }).then(() => {
              window.open(
                `${res.data.errmsg}?callback=${encodeURIComponent(decodeURIComponent(window.location.href))}`,
                '_self',
              );
            });
          } else {
            window.parent.postMessage(
              {
                code: Number(res.data?.errcode) || res.data?.code,
                message: res.data?.errmsg || res.data?.message,
                type: 'ems-login-failure',
              },
              window.location.origin,
            );
          }
          return {
            code: Number(res.data?.errcode) || res.data?.code,
            message: '暂无数据',
            type: 'ems-login-failure',
          };
        }
        return res?.data?.size
          ? res?.data
          : {
              code: Number(res.data?.errcode) || res.data?.code,
              message: res.data?.errmsg || res.data?.message,
              data: res.data?.data,
              success: res.data?.success,
            };
      }
    })
    .catch((e) => {
      const messageIns = document.getElementsByClassName('el-message');
      if (messageIns?.length && messageIns?.[0]) {
        (messageIns[0] as HTMLElement).style.display = 'none';
      }
      // 如果存在字段sourceValue 点击跳转登录页
      if (FGetStorageData('ems-sourceValue')) {
        if (messageBoxFlag) {
          return;
        }
        messageBoxFlag = true;
        ElMessageBox.confirm('登录信息已失效，请重新登录', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning',
          showCancelButton: false,
          showClose: false,
          closeOnClickModal: false,
        }).then(() => {
          window.open(
            `${e.response?.data?.errmsg}?callback=${encodeURIComponent(decodeURIComponent(window.location.href))}`,
            '_self',
          );
        });
      } else {
        const code = Number(e.response?.data?.errcode) || e.response?.data?.code;
        if (code === 401) {
          window.parent.postMessage(
            {
              code: Number(e.response?.data?.errcode) || e.response?.data?.code,
              message: e.response?.data?.errmsg || e.response?.data?.message,
              type: 'ems-login-failure',
            },
            window.location.origin,
          );
        }
      }

      // 兼容errcode errmsg
      if (e.response?.data?.errcode) {
        return {
          code: e.response?.data?.errcode,
          message: e.response?.data?.errmsg,
        };
      }
    });
};

// 请求超时函数
const timeoutfn = (delay: number, url: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`请求超时--${url}`);
    }, delay);
  });
};

// 单个请求 存在请求超时
export async function req(params: { [key: string]: any }, delay = ServiceConfig.TIME_OUT) {
  try {
    const response: any = await Promise.race([timeoutfn(delay, params.url), publicReq(params)]);
    return response;
  } catch (error) {
    return Promise.reject(error);
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
    return Promise.reject(err);
  }
}

// POST request
export async function postRequest(url: string, param?: { [key: string]: any } | number | string) {
  try {
    const response = await req({
      url,
      method: 'post',
      param,
    });
    return response;
  } catch (err) {
    return Promise.reject(err);
  }
}
