///<reference path="./types/index.d.ts"/>
///<reference path="./pages/**/index.d.ts"/>

/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module 'lodash';
declare module 'element-resize-detector';
declare module 'vxe-table';
declare module '@antv/g2';
declare module 'crypto-js';

declare module '@tiansu/ts-web-package';
declare module '@tiansu/tools';
declare module '@arco-iconbox/vue-te';

//设置全局属性
interface Window {
  //window对象属性
  IS_PRODUCTION: boolean; //加入对象
}
