
declare namespace OperateSuggestionModule {
    // 请求列表
    export interface QueryParams extends GlobalModule.CommonSearchParams {
        name: string;
    }
    // 详情
    export interface OperateSuggestionInfo {
        causeId: number;
        causeName: string;
        id: number;
        name: string;
    }
    // 删除
    export interface DeleteParams {
        id: number;
    }
    // 新增
    export interface CreateParams {
        causeId: number;
        name: string
    }
    // 编辑
    export interface UpdateParams extends CreateParams {
        id: number;
    }
    interface AbnormalInfo {
        name: string;
        id: number;
    }
}

