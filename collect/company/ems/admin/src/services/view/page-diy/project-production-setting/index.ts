import { postRequest } from '@/services/request';

const productSetting = {
    /**
     * 获取初始数据；
     */
    async getInitData(
        params:string
    ) {
        const res = await postRequest('/admin/portal/component/configGet/project',params);
        return res;
    },
    /**
     * 保存数据；
     */
     async saveData(params: any) {
        const res = await postRequest('/admin/portal/component/config/project', params);
        return res;
    },
   
};

export default productSetting;
