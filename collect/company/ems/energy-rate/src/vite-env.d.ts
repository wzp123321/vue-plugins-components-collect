/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare interface Window {
  IS_PRODUCTION: boolean;
}

declare module 'lodash';

declare module '@tiansu/tools';
declare module '@tiansu/element-plus';
declare module '@tiansu/element-plus/es/locale/lang/zh-cn';
declare module '@arco-iconbox/vue-te';
