declare namespace BenchMarkingAnalysis {
  // 搜索
  export interface QueryParams extends GlobalModule.CommonSearchParams {
    name: string;
    startDate: string;
    endDate: string;
    parentId: number;
    sonId: number;
    timeType: number;
  }
  // 头部表单
  export interface BenchMarkingForm extends GlobalModule.CommonSearchParams {
    name: string;
    date: any;
    parentId: number | null;
    sonId: number | null;
    timeType: number;
  }
  // 父体系
  export interface ParentVO {
    parentName: string;
    parentId: number;
  }
  // 子体系
  export interface ChildVO {
    sonId: number;
    sonName: string;
  }
  // 详情
  export interface BenchMarkingBuildVO {
    actualValue: number;
    archId: number;
    archName: string;
    benchmarkValue: number;
    buildId: number;
    buildName: string;
    evaluate: string;
    treeId: number;
    unit: string;
  }
  // 导出建筑列表
  export interface ExportBuildListParams extends QueryCommonParams {
    name: string;
  }
  // 请求建筑内树节点数据
  export interface QueryBuildTreeParams extends QueryCommonParams {
    buildId: number;
  }
  // 公共参数
  export interface QueryCommonParams {
    endDate: string;
    sonId: number;
    startDate: string;
    timeType: number;
  }
  // 建筑对标详情
  export interface BenchMarkingBuildDetail {
    benchmarkingBuildingDetailListVOTreeList: BenchmarkingBuildingDetailListVOTreeList[];
    benchmarkingBuildingDetailVO: BenchmarkingBuildingDetailVO;
  }
  // 关联区域树节点能耗列表
  export interface BenchmarkingBuildingDetailListVOTreeList {
    actualValue: number;
    averageValue: number;
    benchmarkValue: number;
    date: string;
    treeName: string;
    unit: string;
  }
  // 建筑详情数据
  export interface BenchmarkingBuildingDetailVO {
    address: string;
    airConditionedArea: number;
    area: number;
    buildingType: string;
    buildingYear: number;
    coolingMode: string;
    curtainType: string;
    glassType: string;
    heatingArea: number;
    heatingMode: string;
    layers: number;
    name: string;
    shapeCoefficient: number;
    structure: string;
    treeId: number;
    treeName: string;
    wallMaterial: string;
    wallWarmMode: string;
    windowMaterialType: string;
  }
}

/**
 * 管理模块
 */
declare namespace BenchMarkingManage {
  // 查询
  export interface QueryParams extends GlobalModule.CommonSearchParams {
    name: string;
    type: number;
    parentId: number;
  }
  // 详情
  export interface BenchMarkingDetail {
    archTypeId: number;
    archTypeName: string;
    archTypeUnit: string;
    benchmarkValue: number;
    id: number;
    name: string;
    parentId: number;
    parentName: string;
    timeType: string;
  }
  //父体系
  export interface ParentForm {
    parentName: string;
    parentOptions: parentOptions[];
  }
  interface parentOptions {
    parentName: string | null;
    archTypeUnit: string | null;
    benchmarkValue: number | null;
    archTypeId: number | null;
    name: string | null;
    archTypeName: string | null;
    timeType: string | null;
    id: number | null;
    parentId: number;
  }
  //子体系
  export interface SonForm {
    sonName: string;
    timeType: string;
    archTypeId: number | undefined;
    benchmarkValue: string;
  }
}
