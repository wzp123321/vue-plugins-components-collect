import { postRequest } from '@/services/request';

const sequentialOverview = {
    /**
     * 获取初始数据；
     */
    async getEnergyCode(
        params: {
            energyFlag: string,
            parentCode: string
        }
    ) {
        const res = await postRequest('/admin/energy/code/listBy', params);
        return res;
    },
    /**
     * 获取初始数据；
     */
    async getInitData(
        params: number
    ) {
        const res = await postRequest('/admin/componentTrendConfig/queryCompareConfig', params);
        return res;
    },
    /**
     * 保存数据；
     */
    async saveData(params: {
        componentCode: string,
        id: number,
        title: string,
        energyCodes: string
    }) {
        const res = await postRequest('/admin/componentTrendConfig/saveTrendConfig', params);
        return res;
    },

};

export default sequentialOverview;
