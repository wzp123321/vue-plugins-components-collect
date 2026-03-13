/**
 * @description 扩展ruoter-meta的类型
 * title 路由标题
 * keepAlive 页面是否缓存
 * requiresAuth 路由是不是具有权限
 * closeAble 页签是不是可关闭  true 不能关闭 false 可关闭 默认可关闭
 * noTag 是否可以添加至页签栏，默认可以添加
 * key 当前组件对应的key，可以决定路由对应的组件是否刷新
 */
declare module 'vue-router' {
  interface RouteMeta {
    title: string;
    keepAlive?: boolean;
    requiresAuth?: boolean;
    closeAble?: boolean;
    noTag?: boolean;
    key?: string;
  }
}

export {};
