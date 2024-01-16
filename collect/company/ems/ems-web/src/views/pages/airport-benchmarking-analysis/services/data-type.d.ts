declare namespace AirportBenchMarkingAnalysisModule {
    /**
     * 头部参数
     */
    export interface FormParams {
        treeId: number[];
        time: string
    }
    export interface QueryParams {
        treeId: number;
        time: string
    }
    // 对标结果
    export interface TargetResultVOList {
        name: string;
        status: number;
    }
    // 对标详情
    export interface TargetDetailsVOList extends StandardLibraryMaintenanceModule.CommonParams {
        energyCode: string;
        measureValue: number;
        name: string;
        unit: string;
        status: number;
        targetTypeId: string;
        targetConfigId?: string;
        minValue: number | null;
        maxValue: number | null;
    }
    /**
     * 图表说明
     */
    export interface ChartExplainInfo {
        targetDetailsVOList: TargetDetailsVOList[];
        targetResultVOList: TargetResultVOList[];
    }
}