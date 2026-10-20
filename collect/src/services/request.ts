/**
 * 本工程（collect）的请求接线示例
 *
 * 真正的实现都在 `src/services/http/`（可整目录复制的通用模板）。
 * 本文件只做两件事：
 *   1. 把本工程的鉴权头（ts-token / tenantCode / ts-repeat 签名）接进模板
 *   2. 把「登录失效」处理接成弹窗 + 跳转
 *
 * 为什么不再 `axios.interceptors.use(...)` 改全局：
 *  - 改全局会波及 SDK / 图表 / 上传组件内部的 axios 调用
 *  - 依赖「某个模块被 import 时顺带注册」，漏引一处全站无鉴权且不报错
 * 拿实例用 `http` 即可。
 */
import { ElMessageBox } from 'element-plus';

import { FGetAuthorization, FGetStorageData } from '@/utils';

import { createHttpClient, createTokenManager } from './http';

/** 登录页地址：后端返回登录地址时优先用后端的 */
const LOGIN_PATH = '/login';

/** 登录失效交互：只弹一次（tokenManager 内部已保证 onAuthFailed 只触发一次） */
const handleAuthFailed = () => {
  ElMessageBox.confirm('登录信息已失效，请重新登录', '登录失效', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      window.location.href = LOGIN_PATH;
    })
    .catch(() => undefined);
};

/**
 * 令牌管理器
 *
 * 本工程当前没有刷新接口（原 `utils/refresh-token.ts` 是未完成的演示代码，已删除）。
 * 接入真实刷新接口时，把 refreshApi 换成真实请求即可 —— 注意用裸 axios
 * 或 `skipAuth: true`，否则 401 → 刷新 → 401 会递归。
 */
export const tokenManager = createTokenManager({
  refreshApi: async () => {
    throw new Error('未配置刷新令牌接口');
  },
  onAuthFailed: handleAuthFailed,
});

export const http = createHttpClient({
  baseURL: import.meta.env.VITE_BASE_URL ?? '',
  // env 里是字符串，必须 Number() 转换，不能只写 as number
  timeout: Number(import.meta.env.VITE_TIME_OUT) || 60000,
  tokenManager,
  authHeaderName: 'ts-token',
  authHeaderPrefix: '',
  /** 每个请求动态追加的头部，与原 addToken 行为一致 */
  getHeaders: () => {
    const empId = FGetStorageData('ems-employeeId') ?? '';
    const empName = encodeURIComponent(FGetStorageData('ems-employeeName') ?? '');
    return {
      tenantCode: FGetStorageData('energy-corpid') ?? '',
      loginName: FGetStorageData('energy-loginName') ?? '',
      'ts-repeat': FGetAuthorization(),
      empId,
      empName,
    };
  },
  /** 未登录：HTTP 401 或业务码命中 */
  unauthorizedCodes: [401, '401', 46010001, '46010001'],
  /** 统一错误提示交给业务：模板不内置 UI 依赖 */
  onError: () => undefined,
});

export default http;
