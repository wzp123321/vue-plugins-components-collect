/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module '@tiansu/element-plus';
declare module '@tiansu/ts-web-package';
declare module '@tiansu/tools';
declare module '@arco-iconbox/vue-te';

declare interface Window {
  IS_PRODUCTION: boolean;
  EMS_ASSESS_SECRET: string;
}

declare module 'element-resize-detector';
declare module 'vue-virtual-scroller';
