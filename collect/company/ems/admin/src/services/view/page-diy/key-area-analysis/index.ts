import { postRequest } from '@/services/request';
export interface KpiSaveDateType {
    componentCode: string,
    componentTitle: string,
    id: number,
    treeList: number[]
}
const keyAreaAnalysis = {
    /**
     * 获取初始数据；
     */
    async getInitData(
        params: number
    ) {
        const res = await postRequest('/admin/portal/component/configGet/keyAreas/energy', params);
        return res;
    },
    /**
     *获取能源类型数据
     */
    async getEnergyData(params: number) {
        const res = await postRequest('/admin/portal/component/configGet/keyAreas/energy/areasTree', params);
        return res;
    },
    /**
     * 保存数据；
     */
    async saveData(params: KpiSaveDateType) {
        const res = await postRequest('/admin/portal/component/config/keyAreas/energy', params);
        return res;
    },


};

export default keyAreaAnalysis;
