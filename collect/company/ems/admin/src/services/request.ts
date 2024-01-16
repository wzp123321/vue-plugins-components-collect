import axios, { AxiosResponse } from 'axios';
import ServiceConfig from '../config/request';
import { FGetSessionStorageData, FGetAuthorization, handleLogOut } from '@/utils/token';
// import message from '@/utils/message';
// import { Access } from '@/utils/assess-token/initAccess';
// import GatewayUtil from '@/utils/access-token/gatewayUtil';

import { FORBIDDEN_CODE } from '../config/index';
import { ElMessageBox } from 'element-plus';
// import { APP_ID } from '@/utils/access-token/api';

import store from '../store/index';

let dialogShow = false;

// const assess = new Access();
// const ASSESS_TOKEN_ERROR_CODE = '4f0000002';
// let isRefreshing = false;
// let requestArr: any[] = [];

/**
 * 响应拦截器
 */
// axios.interceptors.response.use(
//   async (res) => {
//     try {
//       if (res?.data?.errcode === ASSESS_TOKEN_ERROR_CODE) {
//         const conf = {
//           url: res?.config?.url as string,
//           method: res?.config?.method as string,
//           param: JSON.parse(res?.config?.data),
//         };
//         return await refreshToken(conf);
//       } else {
//         return res;
//       }
//     } catch (error) {
//       throw error;
//     }
//   },
//   (error) => {
//     throw error.message;
//   },
// );

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
  // const accessToken = GatewayUtil.buildClientAccessToken();
  const { url, method, param, options } = params;
  const instance = axiosInstance();

  return await instance({
    url,
    method,
    ...options,
    // 在请求头里面添加token 如果没有则为空字符串
    headers: {
      'Content-Type':
        Object.prototype.toString.call(param) === '[object String]'
          ? 'application/json; charset=utf-8'
          : 'application/json',
      tenantCode: (FGetSessionStorageData('energy-corpid') as string) ?? '',
      token: (FGetSessionStorageData('energy-token') as string) ?? '',
      loginName: (FGetSessionStorageData('energy-loginName') as string) ?? '',
      Authorization: FGetAuthorization(),
      // access_token: accessToken,
      // app_id: APP_ID,
    },
    [method === 'post' ? 'data' : 'params']: param,
  })
    .then((res: AxiosResponse) => {
      if (res) {
        if (
          Number(res?.data?.errcode) === FORBIDDEN_CODE &&
          !store?.getters?.forbiddenReqFlag &&
          url !== '/getHeadInfo' &&
          url !== '/keepAlive'
        ) {
          store.dispatch('setForbiddenReqFlag', true);
          ElMessageBox.alert('登录信息已失效，请重新登录', '', {
            confirmButtonText: '确认',
            showClose: false,
            showCancelButton: false,
            type: 'warning',
          })
            .then(() => {
              window.location.href = res?.data?.errmsg || res?.data?.message;
            })
            .catch(() => {
              console.warn('cancel');
            });
        }
        // 如果是assess_token过期
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
      if (e.response?.data?.errcode === '4f000002' || e.response?.data?.errcode === '401') {
        if (dialogShow) {
          return {
            code: e.response?.data?.errcode,
            message: e.response?.data?.errmsg,
          };
        }
        dialogShow = true;
        ElMessageBox.alert('登录信息已失效，请重新登录', '', {
          confirmButtonText: '确认',
          showClose: false,
          showCancelButton: false,
          type: 'warning',
        })
          .then(() => {
            handleLogOut();
          })
          .catch(() => {
            console.warn('cancel');
          });
      }
      return {
        code:
          e.response?.data?.errcode === '4f000002' || e.response?.data?.errcode === '401'
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
export async function postRequest(
  url: string,
  param?: { [key: string]: any } | number | string | null,
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
    return Promise.reject(err);
  }
}

/**
 * 刷新token
 * 开关 --
 * 数组存储
 */
// 401 刷新token
// function refreshToken(params: { [key: string]: string }) {
//   requestArr.push(publicReq(params)); //缓存请求到队列中
//   return new Promise((resolve) => {
//     if (!isRefreshing) {
//       isRefreshing = true;
//       assess
//         .init()
//         .then((res) => {
//           if (res) {
//             requestArr.map((MT) => {
//               resolve(MT());
//             });
//             requestArr = []; //清空队列
//           } else {
//             message.error('服务异常');
//           }
//         })
//         .finally(() => {
//           //解除正在刷新
//           isRefreshing = false;
//         });
//     }
//   });
// }
