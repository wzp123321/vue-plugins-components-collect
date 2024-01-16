/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare interface Window {
  LOAD_PLATFORM: string;
  onKeyboardHeightChange: (height: number) => void;
}

declare module '@arco-iconbox/vue-tem';
declare module '@tiansu/ts-mobile-package';
