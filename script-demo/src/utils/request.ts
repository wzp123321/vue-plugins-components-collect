import axios from 'axios';
import { TeMessage, TeMessageBox } from '@tiansu/element-plus';
import httpEnums from './httpStatusEnums';
import { getRequestHeader } from '@/utils/common';
import { storeToRefs } from 'pinia';

import GatewayUtil from '@/utils/safe/GatewayUtil';
import { useCommonStore } from '@/store/common';
import { useUserStore } from '@/store/user';
import { pending } from './cancelRequest';
import { cacheAdapterEnhancer } from './axiosCacheAdapter';

let errMsgDebounceTimer: number | null = null;
const errMsgDebounceWait = 5000;
let hadNotokenWarning = false;

declare module 'axios' {
  interface AxiosRequestConfig {
    cache?: boolean;
  }
}

// 无权限
function closeSystem() {
  const userStore = useUserStore();
  if (!hadNotokenWarning) {
    hadNotokenWarning = true;
    TeMessageBox.confirm('登录已失效，请重新登录', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    }).then(() => {
      if (userStore.loginUrl) {
        localStorage.clear();
        window.open(userStore.loginUrl, 'loginWindow');
        window.close();
      }
      hadNotokenWarning = false;
    });
  }
}
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT),
  adapter: cacheAdapterEnhancer,
});

request.interceptors.request.use(
  async (config) => {
    const commonStore = useCommonStore();
    const { cancelTokenArr } = storeToRefs(commonStore);
    const cusHeaders = getRequestHeader();
    config.headers.set(cusHeaders);
    config.cancelToken = new axios.CancelToken((c) => {
      if (cancelTokenArr.value.length > 100) {
        cancelTokenArr.value = [];
      }
      cancelTokenArr.value.push({ url: config.url, cancel: c });
      pending.push({
        url: config.url,
        data: config.data,
        f: c,
      });
    });
    return config;
  },
  (error) => {
    console.log(error);
    return Promise.reject(error);
  },
);

request.interceptors.response.use(
  async (response) => {
    const res = response.data;
    const statusCode = res.code || response.status;
    const errMsg = res.message || res.msg || res.errmsg || 'Error';
    if (res instanceof Blob) {
      return response;
    }
    if (statusCode === httpEnums.CODES.Success) {
      if (res.errcode === '0') {
        return Promise.resolve(res);
      }
      if (res && ['50010002', '60010002', '0x59010001'].includes(res.errcode)) {
        closeSystem();
        return Promise.reject(new Error(errMsg));
      }
      if (res.errcode === '0x59120002') {
        return Promise.resolve(res);
      }
      if (response.headers['Content-Type'] === 'image/png') {
        return Promise.resolve(res);
      }
      TeMessage({
        message: errMsg || 'Error',
        type: 'warning',
        duration: 5 * 1000,
      });
      return Promise.reject(new Error(errMsg || 'Error'));
    }

    if (statusCode === httpEnums.CODES.UnAuthorized) {
      if (res && res.errcode === '4f000002') {
        return GatewayUtil.retryAccessToken(response.config, request);
      }
      if (res && ['0x59010001', '60010002', '50010002'].includes(res.errcode)) {
        closeSystem();
        return Promise.reject(new Error(errMsg));
      }
      return Promise.reject(new Error('token过期！'));
    }

    TeMessage({
      message: errMsg || 'Error',
      type: 'warning',
      duration: 5 * 1000,
    });
    return Promise.reject(new Error(errMsg || 'Error'));
  },
  async (error) => {
    if (!error.response && error.constructor.prototype === true) {
      error.message = '请求被取消';
      return Promise.reject(error);
    }

    if (
      error.response &&
      error.response.status === httpEnums.HTTP_STATUS.SERVER_ERROR.BadGateway
    ) {
      TeMessage({
        message: '服务连接失败，请检查网络设置',
        type: 'error',
        duration: 3 * 1000,
      });
      return Promise.reject(new Error('请检查网络设置'));
    }

    if (
      error.response.status ===
      httpEnums.HTTP_STATUS.SERVER_ERROR.ServiceUnavailable
    ) {
      return Promise.reject(new Error('服务升级中，请稍后再试'));
    }
    if (error.response.status === httpEnums.CODES.UnAuthorized) {
      if (error.response.data && error.response.data.errcode === '4f000002') {
        return GatewayUtil.retryAccessToken(error.config, request);
      }
      closeSystem();
      return Promise.reject(new Error(error.response.data.errmsg));
    }
    if (
      error.response.data &&
      ['0x59010001', '60010002', '0x60010002', '50010002'].includes(
        error.response.data.errcode,
      )
    ) {
      closeSystem();
      return Promise.reject(new Error(error.response.data.errmsg));
    }

    const errorDebounceHandler = (errorMessage: string) => {
      if (errMsgDebounceTimer) clearTimeout(errMsgDebounceTimer);
      const callNow = !errMsgDebounceTimer;
      errMsgDebounceTimer = window.setTimeout(() => {
        errMsgDebounceTimer = null;
      }, errMsgDebounceWait);
      if (callNow) {
        TeMessage({
          message: errorMessage,
          type: 'error',
          duration: errMsgDebounceWait,
        });
      }
    };
    errorDebounceHandler(error.message);
    return Promise.reject(error);
  },
);

export const downloadBlobFile = (
  url: string,
  name: string,
  type: string,
  cb?: () => void,
) => {
  try {
    const downloadUrl = `${window.location.origin}${url}`;
    console.log('文件下载地址: ', downloadUrl);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = name;
    a.click();
    window.URL.revokeObjectURL(downloadUrl);
    TeMessage.success(`${type}成功！`);
    if (typeof cb === 'function') {
      cb();
    }
  } catch (error) {
    console.log(error);
    if (typeof cb === 'function') {
      cb();
    }
    TeMessage.error(`${type}失败！`);
  }
};

export async function getFileStreamDownload<T>(
  params: T,
  reqUrl: string,
  type: string,
  cbFn?: () => void,
  failCb?: () => void,
  fileName?: string,
) {
  const messageInstance = TeMessage.warning(`正在${type}`);
  try {
    const response: any = await request({
      url: reqUrl,
      method: 'post',
      data: params,
      responseType: 'blob', // 设置响应类型为 blob
    });
    console.log('下载文件响应：', response);

    // 检查响应数据是否为 Blob 类型
    if (response.data instanceof Blob) {
      // 直接处理 blob 响应
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;

      a.download = fileName || '下载文件'; // 使用传入的文件名，如果没有则使用默认名称
      a.click();
      window.URL.revokeObjectURL(url);
      TeMessage.success(`${fileName}下载成功！`);
      if (typeof cbFn === 'function') {
        cbFn();
      }
      messageInstance.close();
      return;
    }

    // 兼容原有的 JSON 响应格式
    if (response.errcode === '0' && response.data) {
      downloadBlobFile(response.data, '', type, () => {
        if (typeof cbFn === 'function') {
          cbFn();
        }
      });
    } else {
      if (typeof failCb === 'function') {
        failCb();
      }
      TeMessage.error(`${type}失败！`);
      messageInstance.close();
    }
  } catch (error) {
    if (typeof failCb === 'function') {
      failCb();
    }

    // 处理 blob 错误响应
    if ((error as any)?.response?.data instanceof Blob) {
      const reader = new FileReader();
      reader.onloadend = (e) => {
        try {
          const errorText = e.target?.result as string;
          const errorData = JSON.parse(errorText);
          TeMessage.error(errorData.message || `${type}失败！`);
        } catch (error) {
          console.log(error);
          TeMessage.error(`${type}失败！`);
        }
        messageInstance.close();
      };
      reader.readAsText((error as any)?.response?.data);
    } else if (
      (error as any)?.response?.data?.size &&
      (error as any)?.response?.data?.type.includes('json')
    ) {
      const reader = new FileReader();
      reader.onloadend = (e) => {
        console.log(e);
        TeMessage.error(`${type}失败！`);
        messageInstance.close();
      };
      reader.readAsText((error as any)?.response?.data);
    } else {
      TeMessage.error(`${type}失败！`);
      messageInstance.close();
    }
  }
}
export { request };
