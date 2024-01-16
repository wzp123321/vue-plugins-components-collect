import { postRequest } from '@/services/request';

const operateSuggestionService = {
    /**
     * 查询列表
     * @param params
     * @returns
     */
    async getOperateSuggestionList(params: OperateSuggestionModule.QueryParams) {
        const res = await postRequest('/admin/abnormal/solution/query', params);
        return res;
    },
    /**
     * 删除数据
     * @param params
     * @returns
     */
    async getOperateSuggestionDelete(params: OperateSuggestionModule.DeleteParams) {
        const res = await postRequest('/admin/abnormal/solution/delete', params);
        return res;
    },
    /**
     * 获取能源异常列表
     * @param params
     * @returns
     */
    async getSolutionRelationList() {
        const res = await postRequest('/admin/abnormal/cause/list');
        return res;
    },

    /**
     * 新增
     * @param params
     * @returns
     */
    async getOperateSuggestionCreate(params: OperateSuggestionModule.CreateParams) {
        const res = await postRequest('/admin/abnormal/solution/create', params);
        return res;
    },
    /**
     * 修改
     * @param params
     * @returns
     */
    async getOperateSuggestionUpdate(params: OperateSuggestionModule.UpdateParams) {
        const res = await postRequest('/admin/abnormal/solution/update', params);
        return res;
    },
};

export default operateSuggestionService;
