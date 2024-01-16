///<reference path="./services/**/*.d.ts"/>
///<reference path="./services/view/**/*.d.ts"/>
///<reference path="./view/pages/**/services/*.d.ts"/>

/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

//设置全局属性
interface Window {
  //window对象属性
  IS_PRODUCTION: boolean; //加入对象
}

declare module 'crypto-js';
declare module 'element-resize-detector';
declare module '*.svg';
declare module '@tiansu/ts-web-package';
declare module '@arco-iconbox/vue-te';
declare module 'vue-grid-layout';
declare module '@tiansu/tools';
declare module 'vue-virtual-scroller';
