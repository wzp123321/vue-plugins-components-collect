
declare namespace DataEntryModule {
    // 详情
    export interface DataEntryInfo {
        collectTime: string;
        id: number;
        remark: string;
        val?: string;
        startValue?: string;
        endValue?: string;
    }
    //   单值请求入参
    export interface DataEntryQueryParams extends GlobalModule.CommonSearchParams {
        paramId: number;
        startTime: string;
        endTime: string;
        timeType: string;
    }
    // 头部表单
    export interface DataEntryForm {
        date: Date[];
    }
    // 时间颗粒度
    export interface TimeDTOInfo {
        timeCode: string;
        timeName: string;
    }

    /**
     * 单值新增表单
     */
    export interface SingleDataForm {
        collectTime: string | Date;
        paramId: number;
        remark: string;
        timeType: string;
        val: number | undefined;
    }
    // 单值编辑
    export interface SingleDataUpdateParams {
        id: number;
        endTimeType: string;
        startTimeType: string
        collectTime: string;
        paramId: number;
        remark: string;
        val: number | undefined;
    }

    // 单值删除
    export interface SingleDataDeleteParams {
        idList: number[];
        timeType: string;
    }



    /**
     * 值差
     */
    export interface DifferenceValueForm extends DifferenceDataCreateForm {
        timeType: string;
    }
    // 新增
    export interface DifferenceDataCreateForm {
        paramId: number;
        remark: string;
        collectTime: string | Date;
        startValue: string | Date;
        endValue: string | Date;
    }
    // 编辑
    export interface DifferenceDataUpdateForm extends DifferenceDataCreateForm {
        dataId: number;
    }
    // 删除
    export interface DifferenceDataDeleteBatch {
        dataIdList: number[];
    }

    /**
     * 时差
     */
    // 查询
    export interface DifferenceDateQueryParams extends GlobalModule.CommonSearchParams {
        paramId: number;
        startTime: string;
        endTime: string;
    }
    // 更新
    export interface DifferenceDateUpdateParams extends DifferenceDataCreateForm {
        dateId: number;
    }
    // 删除
    export interface DifferenceDateDeleteParams {
        dateIdList: number[];
    }
}

