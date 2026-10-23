/**
 * HTTP 响应及错误处理工具
 */
/* eslint-disable max-classes-per-file */
import { TeMessageBox } from 'element-plus';
import type { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import { HTTP_STATUS, BUSINESS_CODE, ERROR_MESSAGE_MAP } from '../constant';
import type {
  ResponseInterceptorConfig,
  ResponseData,
  RequestConfig,
} from '../type';
import { showErrorMessage, extractErrorMessage } from './errorMessage';
import { getAccess } from './config';

// 标记token【登录】失效弹窗是否已弹出过--防止重复弹出
let hadTokenInvalidDialog = false;
// 记录全局 axios 实例
let globalAxiosInstance: AxiosInstance | null = null;

/**
 * 处理业务状态码失败的情况
 * 统一处理业务错误码，包括 Token 无效、重试 access token、证书匹配等特殊场景
 *
 * @param businessCode 业务状态码（res.errcode）
 * @param errMsg 错误消息
 * @param config 响应拦截器配置
 * @param responseData 响应数据（可选，用于某些场景需要返回数据）
 * @param retryConfig 重试配置（可选，用于 access token 重试）
 * @param useDebounce 是否使用防抖显示错误消息（默认 false，用于 HTTP 非 2xx 的情况）
 * @returns Promise，成功返回数据或拒绝错误
 */
function handleBusinessCodeErr({
  businessCode,
  config,
  response,
  error,
}: {
  businessCode: string | undefined;
  config: ResponseInterceptorConfig;
  response?: AxiosResponse<ResponseData, any>;
  error?: AxiosError<ResponseData, any>;
}): Promise<never> {
  const errMsg = extractErrorMessage(response, error);

  // 网关鉴权失效处理
  if (businessCode && config.gatewayAuthInvalidCodes?.includes(businessCode)) {
    return new Promise((resolve, reject) => {
      const Access = getAccess();
      const requestConfig = response?.config as InternalAxiosRequestConfig;
      Access.retryAccessToken(requestConfig, globalAxiosInstance!)
        .then((res: any) => resolve(res))
        .catch(() => reject(new Error(errMsg)));
    });
  }
  // Token 无效
  if (businessCode && config.tokenInvalidCodes?.includes(businessCode)) {
    if (config.onLoginInvalid) {
      config.onLoginInvalid();
      return Promise.reject(new Error(errMsg));
    }
    if (!hadTokenInvalidDialog) {
      hadTokenInvalidDialog = true;
      TeMessageBox.alert('登录信息已失效，请重新登录', {
        showClose: false,
        confirmButtonText: '确定',
      }).then(() => {
        hadTokenInvalidDialog = false;
        if (config.onLoginInvalidConfirm) {
          config.onLoginInvalidConfirm();
        }
      });
    }

    return Promise.reject(new Error(errMsg));
  }

  // 自定义错误扩展处理
  if (config.onErrorExtend) {
    return config.onErrorExtend(
      config,
      response,
      error,
      globalAxiosInstance as AxiosInstance,
    );
  }

  // 其他业务错误，显示提示
  showErrorMessage(errMsg || 'Error', config, response, error);

  return Promise.reject(new Error(errMsg || 'Error'));
}

/**
 * 处理 HTTP 状态码错误
 * 统一处理 HTTP 状态码错误，对于需要检查业务状态码的情况，会调用 handleBusinessCodeErr
 *
 * @param httpStatusCode HTTP 状态码
 * @param error Axios 错误对象
 * @param config 响应拦截器配置
 * @returns Promise，拒绝错误
 */
function handleHttpStatusCodeError(
  httpStatusCode: number,
  error: AxiosError<ResponseData, any>,
  config: ResponseInterceptorConfig,
): Promise<never> {
  const { response } = error;
  const responseData = response?.data as any;
  const businessCode = responseData?.errcode;
  const errStatusCodes = Object.keys(ERROR_MESSAGE_MAP); // 已提供标准错误提示消息的错误状态码列表

  // 处理特定状态码
  if (errStatusCodes.includes(httpStatusCode.toString())) {
    switch (httpStatusCode) {
      case HTTP_STATUS.REQUEST_ERROR.UnAuthorized:
        // 401 需要检查业务状态码（Token 无效、重试等）
        return handleBusinessCodeErr({
          businessCode,
          config,
          response,
          error,
        });
      default:
        showErrorMessage(
          ERROR_MESSAGE_MAP[httpStatusCode],
          config,
          response,
          error,
        );
        return Promise.reject(new Error(ERROR_MESSAGE_MAP[httpStatusCode]));
    }
  }

  // 其他状态码，检查是否有业务状态码需要处理
  // 如果有业务状态码，使用统一方法处理
  if (businessCode) {
    return handleBusinessCodeErr({
      businessCode,
      config,
      response,
      error,
    }) as Promise<never>;
  }

  // 自定义错误扩展处理
  if (config.onErrorExtend) {
    return config.onErrorExtend(
      config,
      response,
      error,
      globalAxiosInstance as AxiosInstance,
    );
  }

  // 没有业务状态码，直接使用 HTTP 错误消息
  const errorMessage = extractErrorMessage(response, error);
  showErrorMessage(errorMessage, config, response, error);

  return Promise.reject(new Error(errorMessage));
}

/**
 * 处理HTTP错误
 */
export function handleHttpError(
  error: AxiosError<ResponseData, any>,
  config: ResponseInterceptorConfig,
  axiosInstance: AxiosInstance,
): Promise<never> {
  globalAxiosInstance = axiosInstance; // 记录全局 axios 实例

  // 使用 axios.isCancel 识别 AbortController 的取消
  if (axios.isCancel(error)) {
    const cancelError = new Error('请求被取消');
    return Promise.reject(cancelError);
  }
  // axios.isCancel(error) 为类型守卫，会把 error 收窄。
  // 在排除 Cancel 后，TypeScript 将剩余类型推断为 never。使用类型断言修复
  const axiosError = error as AxiosError<ResponseData, any>;
  const requestConfig = axiosError.config as RequestConfig;
  const response = axiosError.response as unknown as AxiosResponse<
    ResponseData,
    any
  >;

  // 没有响应（网络错误）
  if (!response) {
    const message = axiosError.message || '网络连接失败，请检查网络设置';
    showErrorMessage(message, config, response, error);
    return Promise.reject(new Error(message));
  }

  // 如果响应类型为 arraybuffer，则将响应数据解析为 JSON 对象
  if (requestConfig.responseType === 'arraybuffer' && response?.data) {
    const decoder = new TextDecoder('utf-8');
    // 使用 TextDecoder 解码 ArrayBuffer 为字符串
    const responseText = decoder.decode(
      response.data as unknown as ArrayBuffer,
    );
    // 将字符串解析为 JSON 对象
    response.data = JSON.parse(responseText);
  }

  // 使用统一方法处理 HTTP 状态码错误
  // 此时 response 一定存在，因为上面已经检查过
  return handleHttpStatusCodeError(
    (response as AxiosResponse).status,
    axiosError,
    config,
  );
}

/**
 * 处理响应数据
 *
 * 注意：此函数只会在 HTTP 状态码为 200-299（2xx）时被调用
 * 因为 axios 的响应拦截器会根据状态码范围决定进入成功还是错误拦截器
 * 非 2xx 的状态码会进入错误拦截器，调用 handleHttpError
 *
 * 此函数需要检查业务状态码（res.errcode），确保业务逻辑成功（默认 "0"）
 */
export function handleResponseData(
  response: AxiosResponse<ResponseData, any>,
  config: ResponseInterceptorConfig,
  axiosInstance: AxiosInstance,
): Promise<any> {
  globalAxiosInstance = axiosInstance; // 记录全局 axios 实例

  const responseData = response.data as any;
  // Blob 文件流
  if (responseData instanceof Blob) {
    return Promise.resolve(responseData);
  }

  // 图片类型
  if (response.headers['content-type'] === 'image/png') {
    return Promise.resolve(responseData);
  }

  // HTTP状态码
  const statusCode = response.status;
  const successCodes = Array.isArray(config.successCode)
    ? config.successCode
    : [config.successCode ?? HTTP_STATUS.SUCCESS.Ok];
  // 业务状态码
  const businessCode = responseData.errcode;
  const businessSuccessCodes = Array.isArray(config.businessSuccessCode)
    ? config.businessSuccessCode
    : [config.businessSuccessCode ?? BUSINESS_CODE.SUCCESS];

  // 当HTTP状态码、业务状态码都成功时 视为接口响应返回无异常
  if (successCodes.includes(statusCode)) {
    if (businessSuccessCodes.includes(businessCode)) {
      return Promise.resolve(responseData);
    }
  }

  // 其它2xx情况 则进一步检查业务状态码
  return handleBusinessCodeErr({
    businessCode,
    config,
    response,
    error: undefined,
  });
}
