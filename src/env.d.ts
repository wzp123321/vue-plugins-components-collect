/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare var __COMPAT__: boolean;
declare module 'crypto-js';

declare global {
  interface Window {
    createObjectURL: any;
  }
}
