import { postRequest } from '@/services/request';

const energyMedicalReportConfig = {
    /**
     * 查询列表
     * @param params
     * @returns
     */
    async getListUrl() {
        const res = await postRequest('/experienceReport/listExperienceReportConfig');
        return res;
    },
    /**
     * 修改配置项数值
     * @param params
     * @returns
     */
    async updateConfigItemValueUrl(params: any) {
        const res = await postRequest('/experienceReport/updateConfigItemValue', params);
        return res;
    },
    /**
     * 修改编辑文案
     * @param params
     * @returns
     */
    async updateEditableTextUrl(params: any) {
        const res = await postRequest('/experienceReport/updateEditableText', params);
        return res;
    },

    /**
     * 保存
     * @param params
     * @returns
     */
     async updateConfigUrl(params: any) {
        const res = await postRequest('/experienceReport/updateConfigObjects', params);
        return res;
    },

};

export default energyMedicalReportConfig;
