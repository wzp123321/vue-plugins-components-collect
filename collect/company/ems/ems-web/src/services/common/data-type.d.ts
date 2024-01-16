/** Http请求模块 */
declare namespace HttpRequestModule {
  /** 接口返参 start */
  interface ResTemplate<T> {
    code: number;
    message: string;
    success: boolean;
    data: T;
  }
  /** 列表接口响应 */
  interface HttpListResponsive<T> {
    list: T;
    pageNum: number;
    pageSize: number;
    pages: number;
    total: number;
  }
  interface HttpBlobRequestResponsive<T> {
    data: T;
    message: string;
    body: string;
    type: string;
  }
}

/** 定义全局接口 */
declare namespace GlobalModule {
  /** 头部搜索参数通用 */
  interface SearchParmas {
    energyCode: any[];
    queryTimeList: Array<any>;
    timeUnit?: number;
    treeIds: number[];
    valueMean: string;
  }
  /** 通用对象 */
  interface CommonObject {
    [key: string]: any;
  }
  /**
   * 通用头部搜索参数
   * @param orders 排序
   * @param pageNum 页码
   * @param pageSize 页数
   * @param searchCount 是否查询total
   */
  /** 通用头部搜索参数 */
  interface CommonSearchParams {
    orders: Array<{
      asc: boolean;
      column: string;
    }>;
    pageNum: number;
    pageSize: number;
    searchCount: boolean;
  }
  /** 字典 */
  interface DictionaryInfo {
    code: string;
    name: string;
  }
  /**
   * 菜单
   */
  interface MenuInfo {
    id: number;
    name: string;
    orderNum: number;
    remark: string;
    type: number;
    url: string;
    childMenu: MenuInfo[];
  }
  /**
   * 菜单响应结果
   */
  interface MenuRes {
    menuList: MenuInfo[];
    defaultUrl: string;
    menuListAll: MenuInfo[];
  }
}

declare namespace TreeManageModule {
  /** 列表返回数据 start */
  interface TreeList {
    airConditionedArea: number;
    area: number;
    childTree: TreeList[];
    lockFlag: boolean;
    createTime: any;
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
    updateTime: any;
  }
  /** 列表返回数据 end */
}
