import { RouteMeta, RouteRecordName } from 'vue-router';

// 通用响应体声明
export interface CommonReturn<T = any> {
  errcode?: string;
  errmsg?: string;
  data: T;
  secretFields?: Array<string>;
}
// 带有分页的列表响应体
export interface CommonReturnList<T = any> {
  list: Array<T>;
  total: number;
  pageNum: number;
  pageSize: number;
  pages: number;
}

// 公共响应类型
export type CommonResponseType<T> = Promise<CommonReturn<T>>;

// 基础分页参数
export interface PageParam {
  pageNum: number;
  pageSize: number;
}

// 树形节点
export type TreeNode<T> = {
  [P in keyof T]: T[P];
} & {
  children?: Array<TreeNode<T>>;
};

// 菜单数据类型
export interface MenuItem {
  id: string | number;
  path: string;
  name: string;
  parentName: string;
  component: any;
  meta: RouteMeta;
  index: number;
}

// 侧边栏入参
export interface LayoutAsideType {
  activeMenuCode?: string;
  activeParentMenuCode?: string;
  menuArray: Array<TreeNode<MenuItem>>;
  isSpread: boolean;
  defaultActive: string | null | undefined | RouteRecordName;
}
