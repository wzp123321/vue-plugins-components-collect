/* eslint-disable @typescript-eslint/no-namespace */

/**
 * @namespace Table
 * @description 包含表格相关的接口和状态
 */
export namespace Table {
  /**
   * @interface PageInfo
   * @description 表格分页信息
   * @property {number} pageNum 当前页码
   * @property {number} pageSize 每页显示数量
   * @property {number} total 数据总数
   */
  export interface PageInfo {
    pageNum: number;
    pageSize: number;
    total: number;
    pageSizes?: number[];
  }

  /**
   * @interface StateProps
   * @description 表格状态相关属性
   * @template T 表格数据项的类型
   * @property {T[]} tableData 表格数据
   * @property {PageInfo} pageInfo 表格分页信息
   * @property {Object} totalParam 总数请求参数
   * @property {Object} tableParam 表格请求参数
   * @property {boolean} loading 数据加载状态
   */
  export interface StateProps<T> {
    tableData: T[];
    pageInfo: PageInfo;
    totalParam: {
      [key: string]: any;
    };
    tableParam: {
      [key: string]: any;
    };
    loading: boolean;
  }
}

/**
 * @namespace TableColumn
 * @description 包含表格列相关的接口和状态
 */
export namespace TableColumn {
  /**
   * @interface StateProps
   * @description 表格列状态相关属性
   * @template T 表格列项的类型
   * @property {T[]} tableColumnData 表格列数据
   * @property {number} pageSize 列表页大小
   */
  export interface StateProps<T> {
    tableColumnData: T[];
    pageSize: number;
  }
}
