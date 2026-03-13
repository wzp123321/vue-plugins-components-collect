/**
 * 声明vue组件类型
 */
declare module '*.vue' {
  import type { DefineComponent } from 'vue';

  const component: DefineComponent<object, object, unknown>;
  export default component;
}

declare module '@tiansu/ts-web-package';
declare module '@arco-iconbox/vue-te';
