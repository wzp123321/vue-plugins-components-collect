/*eslint-disable*/
import axios, { AxiosResponse } from 'axios';
import { FGetSessionStorageData } from '@/utils/index';
import { FGetAuthorization } from '@/utils/crypto';
import ServiceConfig from '../config/request';
// import GatewayUtil from '@/utils/access-token/GatewayUtil';
// import { APP_ID } from '@/utils/access-token/api';

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
      tenantCode: FGetSessionStorageData('energy-corpid') as string,
      token: FGetSessionStorageData('energy-token') as string,
      loginName: FGetSessionStorageData('energy-loginName') as string,
      Authorization: FGetAuthorization(),
      // access_token: GatewayUtil.buildClientAccessToken() || '',
      // app_id: APP_ID,
    },
    [method === 'post' ? 'data' : 'params']: param,
  })
    .then((res: AxiosResponse) => {
      if (res) {
        if ((res?.data as any).respCode === 401) {
          window.parent.postMessage(
            {
              code: (res?.data as any)?.respCode,
              message: (res?.data as any)?.respMsg,
              type: 'ems-login-failure',
            },
            window.location.origin
          );
          return res.data;
        }
        return res.data;
      }
    })
    .catch((e) => {
      const messageIns = document.getElementsByClassName('el-message');
      if (messageIns?.length && messageIns?.[0]) {
        (messageIns[0] as HTMLElement).style.display = 'none';
      }
      if (
        e?.response?.data?.errcode === '4f000002' ||
        e.response?.data?.errcode === '401'
      ) {
        window.parent.postMessage(
          {
            code:
              e.response?.data?.errcode === '4f000002' ||
              e.response?.data?.errcode === '401'
                ? '4f000002'
                : e.response?.data?.errcode,
            message: '',
            type: 'ems-login-failure',
          },
          window.location.origin
        );
      }
      return {
        code:
          e.response?.data?.errcode === '4f000002' ||
          e.response?.data?.errcode === '401'
            ? '4f000002'
            : e.response?.data?.errcode,
        message: e.response?.data?.errmsg,
      };
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
export async function req(
  params: { [key: string]: any },
  delay = ServiceConfig.TIME_OUT
) {
  try {
    const response: any = await Promise.race([
      timeoutfn(delay, params.url),
      publicReq(params),
    ]);
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
export async function postRequest(
  url: string,
  param?: { [key: string]: any } | number | string
) {
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
