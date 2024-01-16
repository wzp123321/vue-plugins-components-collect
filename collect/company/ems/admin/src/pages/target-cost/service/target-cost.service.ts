import { postRequest } from '@/services/request';

const TargetCostService = {
    /**
     * 获取列表
     */
    async getTargetCostList(params: GlobalModule.CommonSearchParams): Promise<
        HttpRequestModule.ResTemplate<
            HttpRequestModule.HttpListResponsive<TargetCostModule.TargetCostInfo[]>
        >
    > {
        const res: HttpRequestModule.ResTemplate<HttpRequestModule.HttpListResponsive<
            TargetCostModule.TargetCostInfo[]
        >> = await postRequest('/admin/abnormal/cost/query', params);
        return res;
    },
    /**
     * 新增
     */
    async addTarget(params: TargetCostModule.CreateParams) {
        const res: HttpRequestModule.ResTemplate<any> = await postRequest('/admin/abnormal/cost/create', params);
        return res;
    },
    /**
     * 编辑
     */
    async editTarget(params: TargetCostModule.UpdateParams) {
        const res: HttpRequestModule.ResTemplate<any> = await postRequest('/admin/abnormal/cost/update', params);
        return res;
    },
    /**
     * 删除
     */
    async deleteTarget(params: TargetCostModule.DeleteParams) {
        const res: HttpRequestModule.ResTemplate<any> = await postRequest('/admin/abnormal/cost/delete', params);
        return res;
    },
};

export default TargetCostService;
