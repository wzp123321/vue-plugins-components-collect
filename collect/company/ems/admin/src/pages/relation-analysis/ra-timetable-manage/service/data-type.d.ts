
/** Http请求模块 */
declare namespace TimeTableModule {
    /** 接口返参 start */
    export interface queryObject {
        afternoonEnd: string
        afternoonStart: string
        id: any
        morningEnd: string
        morningStart: string
        nightEnd: string
        nightStart: string
    }

    // 周作息
    export interface WeekTimeTableInfo {
        afternoonEnd: string;
        afternoonStart: string;
        id: number;
        morningEnd: string;
        morningStart: string;
        nightEnd: string;
        nightStart: string;
        treeId: number | number[];
        week: number;
    }
    export interface WeekTimeTableCreateParams {
        afternoonEnd: string;
        afternoonStart: string;
        id: number;
        morningEnd: string;
        morningStart: string;
        nightEnd: string;
        nightStart: string;
        treeIdList: number[];
        week: number;
    }
    // 周作息表单
    export interface WeekTimeTableForm extends CommonTimeTableForm {
        week: number;
        treeId: number;
        id: number;
    }
    /**
     * 特殊作息
     */
    // 详情
    export interface SpecialTimeTableInfo {
        afternoonEnd: Date;
        afternoonStart: Date;
        date: string;
        id: number;
        morningEnd: Date;
        morningStart: Date;
        nightEnd: Date;
        nightStart: Date;
        remark: string;
        treeId: number;
    }
    // 特殊作息请求参数
    export interface SpecialQueryForm extends GlobalModule.CommonSearchParams {
        endDate: string;
        startDate: string;
        treeId: number;
    }
    // 特殊作息表单
    export interface SpecialPageForm extends CommonTimeTableForm {
        date: Date | undefined;
        remark: string;
    }

    interface CommonTimeTableForm {
        isAfterReset: boolean;
        isMorningReset: boolean;
        isEveningReset: boolean;
        morningDate: Date[];
        afternoonDate: Date[];
        eveningDate: Date[];
    }
}