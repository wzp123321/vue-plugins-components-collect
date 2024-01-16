import { postRequest } from '@/services/request';

const EnergyComparisonGroupService = {
    /**
     * 获取列表
     */
    async getComparisonList(params: GlobalModule.CommonSearchParams): Promise<
        HttpRequestModule.ResTemplate<
            HttpRequestModule.HttpListResponsive<EnergyComparisonGroupModule.EnergyCompareGroupInfo[]>
        >
    > {
        const reqUrl = '/admin/abnormal/contrast/queryAbnormalContrastConfig';
        const res: HttpRequestModule.ResTemplate<HttpRequestModule.HttpListResponsive<
            EnergyComparisonGroupModule.EnergyCompareGroupInfo[]
        >> = await postRequest(reqUrl, params);
        return res;
    },
    /**
     * 新增
     */
    async addComparison(params: EnergyComparisonGroupModule.CreateParams) {
        const reqUrl = '/admin/abnormal/contrast/create';
        const res: HttpRequestModule.ResTemplate<any> = await postRequest(reqUrl, params);
        return res;
    },
    /**
     * 编辑
     * @param params
     * @returns
     */
    async editComparison(params: EnergyComparisonGroupModule.UpdateParams) {
        const reqUrl = '/admin/abnormal/contrast/update';
        const res: HttpRequestModule.ResTemplate<any> = await postRequest(reqUrl, params);
        return res;
    },
    /**
     * 删除
     */
    async deleteComparison(params: EnergyComparisonGroupModule.DeleteParams) {
        const reqUrl = '/admin/abnormal/contrast/delete';
        const res: HttpRequestModule.ResTemplate<any> = await postRequest(reqUrl, params);
        return res;
    },
};

export default EnergyComparisonGroupService;
