import { postRequest } from '@/services/request';

const pageDiyService = {
    /**
     * 获取初始布局；
     */
    async getInitLayout(
        // params:pageDiyHttp.getInitType,
    ) {
        const res = await postRequest('/admin/componentPageConfig/queryComponentPage');
        return res;
    },
    /**
     * 保存布局；
     */
     async saveLayout(params: pageDiyHttp.GetInitType) {
        const res = await postRequest('/admin/componentPageConfig/saveComponentPage', params);
        return res;
    },
    /**
     * 新增组件（查询）；
     */
     async addQueryComponent(params: pageDiyHttp.AddQueryComponents) {
        const res = await postRequest('/admin/componentConfig/queryComponents', params);
        return res;
    },
};

export default pageDiyService;
