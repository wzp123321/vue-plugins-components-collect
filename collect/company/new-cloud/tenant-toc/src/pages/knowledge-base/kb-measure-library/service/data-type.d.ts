declare namespace MeasureLibrary {
  /**
   * 查询表格数据 入参
   * @param name 模糊查询
   */
  interface ordersType {
    asc: boolean;
    column: string;
  }
  export interface getListUrlParams {
    measureCode: string;
    measureName: string;
    measureStatus: string;
    orders: ordersType[];
    pageNum: number;
    pageSize: number;
    searchCount: boolean;
    systemId: string;
  }

  /**
   * table表格数据，查询接口返回参数
   * @param description 措施描述
   * @param executionCycle 建议执行周期：1-每日、2-工作日、3-每周、4-每月、5-特殊时间
   * @param measureCode 措施编码
   * @param measureName  措施名称
   * @param measureSource  措施来源:1-人工录入、2-批量导入、3-app录入
   * @param measureStatus  措施状态：1-有效、2-无效
   * @param systemId 	所属系统：1-暖通，2-能源管理系统，3-综合监控系统，4-其他
   * @param updateTime 	录入时间
   */
  export interface tableDataSourceVO {
    description: string;
    executionCycle: string;
    id: number;
    measureCode: string;
    measureName: string;
    measureSource: string;
    measureStatus: string;
    systemId: string;
    updateTime: string;
  }

  /**
   * 新增 入参
   * @param  description 	描述
   * @param  executionCycle 	建议执行周期：1-每日、2-工作日、3-每周、4-每月、5-特殊时间
   * @param  measureName  	措施名
   * @param  measureStatus 措施状态：1-有效、2-无效
   * @param  systemId  所属系统：1-暖通，2-能源管理系统，3-综合监控系统，4-其他
   */
  export interface addUrlParams {
    description: string;
    executionCycle: string;
    measureName: string;
    measureStatus: string;
    systemId: string;
    measureCode?: string;
  }

  /**
   * 编辑 入参
   * @param  description 	描述
   * @param  executionCycle 	建议执行周期：1-每日、2-工作日、3-每周、4-每月、5-特殊时间
   * @param  measureCode  	措施编码
   * @param  measureName  	措施名
   * @param  measureSource 	措施来源:1-人工录入、2-批量导入、3-app录入
   * @param  measureStatus 措施状态：1-有效、2-无效
   * @param  systemId  所属系统：1-暖通，2-能源管理系统，3-综合监控系统，4-其他
   * @param  updateTime  录入时间
   */
  export interface editUrlParams {
    description: string;
    executionCycle: string;
    id: number;
    measureCode: string;
    measureName: string;
    measureSource: string;
    measureStatus: string;
    systemId: string;
    updateTime: string;
  }

  // 所属系统 & 措施状态 & 执行周期 list
  export interface type {
    code: string;
    name: string;
  }

  // 文件流type
  export interface fileType {
    lastModified: number;
    lastModifiedDate: any;
    name: string;
    size: number;
    type: string;
    webkitRelativePath: string;
  }

    /**
   * 导入异常返回数据
   */
     export interface errorDataListType {
      detail: string;
      position: string;
    }
}
