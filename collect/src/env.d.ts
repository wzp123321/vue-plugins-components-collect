/// <reference types="vite/client" />

/**
 * 环境变量类型（值一律是字符串，数字请在实际使用处 Number() 转换）
 */
interface ImportMetaEnv {
  readonly VITE_DEV_SERVER_PORT?: string;
  readonly VITE_PROXY_URL?: string;
  readonly VITE_TIME_OUT?: string;
  readonly VITE_BASE_URL?: string;
  readonly VITE_NODE_ENV?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare global {
  interface Window {
    createObjectURL: any;
  }
}

declare var __COMPAT__: boolean;
declare module 'crypto-js';
declare module 'd3';
declare module 'vue-virtual-scroller';
declare module '@arco-iconbox/vue-te';
declare module 'qrcode';
declare module 'file-saver';
declare module 'frappe-gantt';
