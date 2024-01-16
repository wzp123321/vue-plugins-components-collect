/**
 * 标准库维护模块
 */
declare namespace StandardLibraryMaintenanceModule {
    /**
     * 请求入参
     */
    export interface QueryFormParams extends GlobalModule.CommonSearchParams {
        name: string;
        treeId: number;
    }
    /**
       * 头部请求入参
       */
    export interface FormParams extends GlobalModule.CommonSearchParams {
        name: string;
        treeId: number[];
    }
    interface CommonParams {
        targetTypeId: string;
        targetConfigId?: string;
        minValue: number | null;
        maxValue: number | null;
    }
    /**
     * 表格
     */
    export interface StandardLibraryInfo extends CommonParams {
        energyCode: string;
        energyName: string;
        name: string;
        unit: string;
    }
    /**
     * 编辑参数
     */
    export interface UpdateParams extends CommonParams {
        treeId: number;
    }
}