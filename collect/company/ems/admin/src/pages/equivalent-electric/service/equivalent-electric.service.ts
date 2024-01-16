import { postRequest } from '@/services/request';

const EquivalentElectricService = {
    /**
     * 获取列表
     */
    async getInitElectricTab(params: GlobalModule.CommonSearchParams): Promise<
        HttpRequestModule.ResTemplate<
            HttpRequestModule.HttpListResponsive<EquivalentElectricModule.EquivalentElectricInfo[]>
        >
    > {
        const res: HttpRequestModule.ResTemplate<HttpRequestModule.HttpListResponsive<
        EquivalentElectricModule.EquivalentElectricInfo[]
        >> = await postRequest('/admin/query/config/benchmarking/convert/ele/coef/page', params);
        return res;
    },
    /**
     * 获取能耗编码list
     */
     async queryEnergyCode() {
        const res: HttpRequestModule.ResTemplate<any> = await postRequest('/admin/energy/code/listEnergyExcludeTotal');
        return res;
    },
    /**
     * 新增
     */
    async addElectric(params: EquivalentElectricModule.CreateParams) {
        const res: HttpRequestModule.ResTemplate<any> = await postRequest('/admin/add/config/benchmarking/convert/ele/coef', params);
        return res;
    },
    /**
     * 编辑
     */
    async editElectric(params: EquivalentElectricModule.UpdateParams) {
        const res: HttpRequestModule.ResTemplate<any> = await postRequest('/admin/update/config/benchmarking/convert/ele/coef', params);
        return res;
    },
    /**
     * 删除
     */
    async deleteElectric(params: any) {
        const res: HttpRequestModule.ResTemplate<any> = await postRequest('/admin/delete/config/benchmarking/convert/ele/coef', params);
        return res;
    },
};

export default EquivalentElectricService;
