/** Http请求模块 */
declare namespace BenchmarkingLibrary {
  /**
   * 查询表格数据 入参
   * @param name 模糊查询
   */
  interface ordersType {
    asc: boolean;
    column: string;
  }
  export interface getListUrlParams {
    name: string;
    orders: ordersType[];
    pageNum: number;
    pageSize: number;
    searchCount: boolean;
  }
   /**
   * table表格数据，查询接口返回参数
   * @param coolingMode 供冷类型
   * @param general 	是计算能耗（0 否，1 是）
   * @param heatingMode 供暖类型
   * @param regionType  所属地区
   * @param systemLevel 对象等级
   * @param systemName  对标对象名称
   * @param systemType 	对象类型
   */
    export interface tableDataSourceVO {
      coolingMode: string;
      coolingModeText: string;
      general: string;
      heatingMode: string;
      heatingModeText: string;
      id: number;
      regionType: string;
      regionTypeText: string;
      systemLevel: string;
      systemLevelText: string;
      systemName: string;
      systemType: string;
      systemTypeText: string;
    }

  /**
   * 删除 入参
   */
  export interface deleteUrlParams {
    id: number;
  }
  /**
   * 新增 入参
   * @param  coolingMode 供冷类型
   * @param  heatingMode 供暖类型
   * @param  regionType  所属地区
   * @param  systemLevel 对象等级
   * @param  systemName  对标对象名称
   * @param  systemType  对象类型
   */
  export interface addUrlParams {
    coolingMode: string;
    heatingMode: string;
    regionType: string;
    systemLevel: string;
    systemName: string;
    systemType: string;
  }
  /**
   * 编辑 入参
   */
  export interface updateUrlParams extends addUrlParams {
    id: number;
  }
  /** 通用对象 */
  interface CommonObject {
    [key: string]: any;
  }
}
