import { postRequest } from '@/services/request';

const groupRankedService = {
    /**
     * 获取列表
     * @param params
     * @returns
     */
    async queryAbnormalGroup(params: GroupRankedModule.GroupRankedQueryParams) {
        const res = await postRequest('/admin/abnormal/group/query', params);
        return res;
    },
    /**
     * 删除列表数据
     * @param params
     * @returns
     */
    async getAbnormalGroupDelete(params: number) {
        const res: any = await postRequest('/admin/abnormal/group/delete', params);
        return res;
    },
    /**
     * 新增分组排名
     * @param params
     * @returns
     */
    async getAbnormalGroupAdd(params: GroupRankedModule.GroupRankedCreateParams,
    ) {
        const res = await postRequest('/admin/abnormal/group/create', params);
        return res;
    },
    /**
     * 获取用能分组排名详情内部的树节点数据列表
     * @param params
     * @returns
     */
    async getAbnormalGroupTreeList(params: GroupRankedModule.GroupRankedQueryTreeParams,
    ) {
        const res = await postRequest('/admin/abnormal/group/queryTree', params);
        return res;
    },
    /**
     * 删除组和树关联表数据
     * @param params
     * @returns
     */
    async getGroupTreeDelete(
        params: GroupRankedModule.GroupRankedDeleteParams,
    ) {
        const res = await postRequest('/admin/abnormal/group/deleteTree', params);
        return res;
    },
    /**
     * 修改
     * @param params
     * @returns
     */
    async getAbnormalGroupUpdate(
        params: GroupRankedModule.GroupRankedUpdateParams,
    ) {
        const res = await postRequest('/admin/abnormal/group/update', params);
        return res;
    },

};

export default groupRankedService;
