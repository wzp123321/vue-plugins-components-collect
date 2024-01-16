/*eslint-disable*/
import axios, { AxiosResponse } from 'axios';
import { FGetSessionStorageData, FGetAuthorization, handleLogOut, clearCookies } from '@/utils';
import ServiceConfig from '@/config/request';
import useCurrentInstance from '@/utils/use-current-instance';
// import GatewayUtil from '@/utils/access-token/GatewayUtil';
// import { APP_ID } from '@/utils/access-token/api';
import { ElMessageBox } from 'element-plus';

let messageFlag = false;

const { proxy } = useCurrentInstance();
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
      tenantCode: FGetSessionStorageData('energy-corpid') ?? '',
      token: FGetSessionStorageData('energy-token') ?? '',
      loginName: FGetSessionStorageData('energy-loginName') ?? '',
      Authorization: FGetAuthorization(),
      // access_token: GatewayUtil.buildClientAccessToken() || '',
      // app_id: APP_ID,
    },
    [method === 'post' ? 'data' : 'params']: param,
  })
    .then((res: AxiosResponse) => {
      if (res) {
        if (Number(res.data?.errcode) === 404 || res.data.code === 404) {
          return proxy.$message.error('服务器找不到请求的网页！');
        }
        if (Number(res.data?.errcode) === 401 || res.data.code === 401) {
          throttleMessage({
            data: {
              code: Number(res.data?.errcode) || res.data?.code,
              message: res.data?.errmsg || res.data?.message,
              type: 'ems-login-failure',
            },
          });
        }
        return {
          code: Number(res.data?.errcode) || res.data?.code,
          message: res.data?.errmsg || res.data?.message,
          data: res.data?.data,
          success: res.data?.success,
        };
      }
    })
    .catch((e) => {
      throttleMessage({
        data: {
          code: e.response?.data?.errcode,
          message: e.response?.data?.errmsg,
          type: 'ems-login-failure',
        },
      });
      // 兼容errcode errmsg
      if (e.response?.data?.errcode) {
        return {
          code: e.response?.data?.errcode,
          message: e.response?.data?.errmsg,
        };
      }
    });
};
const throttleMessage = (e: any) => {
  console.warn('e------------------', e);
  if (String(e?.data?.code) !== '4f000002' && String(e?.data?.code) !== '401') {
    return;
  }
  if (messageFlag) {
    return;
  }
  messageFlag = true;

  ElMessageBox.alert('登录信息已失效，请重新登录', '', {
    confirmButtonText: '确认',
    showClose: false,
    showCancelButton: false,
    type: 'warning',
  })
    .then(() => {
      if (e.data.code === '4f000002') {
        handleLogOut();
      } else if (String(e?.data?.code) === '401') {
        window.location.href = e?.data?.message;
        clearCookies();
        // GatewayUtil.removeAccessTokenStorage();
        // GatewayUtil.removeShareStorage();
      }
    })
    .catch(() => {
      console.warn('cancel');
    });
};
//节流提示只显示一次
window.addEventListener('message', (e) => {
  if (e?.data?.type === 'ems-login-failure') {
    throttleMessage(e);
  }
});

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
