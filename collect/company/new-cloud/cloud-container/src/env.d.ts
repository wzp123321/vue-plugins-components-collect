/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
declare module 'crypto-js';
declare module '@tiansu/ts-web-package';
declare module '@arco-iconbox/vue-te';
declare module '@arco-iconbox/vue-icon-toc';
