declare namespace GeneralModule {
  /**
   * http请求
   */
  interface HttpResponseImpl<T> {
    code: number;
    message: string;
    success: boolean;
    data: T;
  }
  /**
   * http 列表请求
   */
  interface HttpListResponseImpl<T> {
    pageNum: number;
    pageSize: number;
    pages: number;
    total: number;
    list: T;
  }
  /**
   * 公共头部查询表单
   */
  interface CommonQueryParams {
    keyword?: string;
    orders?: {
      asc: boolean;
      column: string;
    }[];
    pageNum: number;
    pageSize: number;
    searchCount?: boolean;
  }
  /**
   * 菜单栏
   */
  interface MenuInfo {
    childMenu: MenuInfo[];
    id: number;
    name: string;
    orderNum: number;
    remark: string;
    type: number;
    url: string;
  }
  /**
   * 字典
   */
  interface DictionaryInfo {
    code: string;
    name: string;
  }
  /**
   * 树
   */
  interface TreeInfo {
    airConditionedArea: number;
    area: number;
    childTree: TreeInfo[];
    createTime: number;
    hospitalCode: string;
    id: number;
    parentId: number;
    parentIds: string;
    peopleNumber: number;
    treeLeaf: number;
    treeLevel: number;
    treeName: string;
    treeNames: string;
    treeSort: number;
    treeType: number;
    updateTime: number;
  }

  export interface CommonObject {
    [key: string]: any;
  }

  /**
   * 租户
   */
  interface TenantVO {
    tenantCode: string;
    tenantId: number;
  }

  /**
   * 登录菜单鉴权
   */
  interface HostingMenu {
    tenantCode: string;
    tenantId: number;
    url: string;
    systemFlag: string;
    isDefaultUrl: string;
    historyFlag: string;
  }
}
declare namespace HttpRequestModule {
  /** 接口返参 start */
  export interface ResTemplate<T> {
    code: number;
    message: string;
    success: boolean;
    data: T;
  }

  interface HttpListResponsive<T> {
    list: T;
    pageNum: number;
    pageSize: number;
    pages: number;
    total: number;
  }
  /** 接口返参 end */

  /** 列表入参 start */
  interface CommonListParam {
    orders: ListOrders[];
    pageNum: number;
    pageSize: number;
    searchCount: boolean;
  }

  interface ListOrders {
    asc: boolean;
    column: string;
  }
  /** 列表入参 end */

  /** 列表返回 start */
  interface ListResTemplate {
    pageNum: number;
    pageSize: number;
    pages: number;
    total: number;
  }
  /** 列表返回 end */
}

/**
 * 定义全局接口
 */
declare namespace GlobalModule {
  /**
   * 通用对象
   */
  interface CommonObject {
    [key: string]: any;
  }
}

declare module 'js-md5';
