
/** Http请求模块 */
declare namespace GroupRankedModule {
    // 详情
    export interface GroupRankedInfo {
        energyCode: string;
        energyName: string;
        id: number;
        name: string;
    }
    // 查询参数
    export interface GroupRankedQueryParams extends GlobalModule.CommonSearchParams {
        name: string;
    }
    // 新增
    export interface GroupRankedCreateParams {
        energyCode: string;
        name: string;
        treeIdList: number[]
    }
    // 删除
    export interface GroupRankedDeleteParams {
        id: number;
    }
    // 修改
    export interface GroupRankedUpdateParams {
        energyCode: string;
        id: number;
        name: string;
        treeIdList: number[];
    }
    // 查询树节点数据列表
    export interface GroupRankedQueryTreeParams {
        groupId: number;
    }
}
