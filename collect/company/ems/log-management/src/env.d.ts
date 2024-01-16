/// <reference types="vite/client" />
/// <reference path="./utils/data.d.ts" />

declare module '*.vue' {
  import { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module 'crypto-js';

declare module 'lodash';

declare module '@tiansu/tools';
