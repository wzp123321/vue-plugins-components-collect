
declare namespace AbnormalReasonModule {
    //    请求参数
    export interface QueryParams extends GlobalModule.CommonSearchParams {
        name: string;
        typeId: number | undefined | string;
    }
    // 删除
    export interface DeleteParams {
        id: number;
    }
    // 新增
    export interface CreateParams {
        name: string;
        typeIdList: number[];
    }
    // 编辑
    export interface UpdateParams extends CreateParams {
        id: number;
    }
    // 详情
    export interface AbnormalReasonInfo {
        id: number;
        name: string;
        typeId: string;
        typeName: string
    }
}
