import { postRequest } from '@/services/request';

const abnormalReasonService = {
    /**
     * 查询列表
     * @param params
     * @returns
     */
    async getAbnormalReasonList(params: AbnormalReasonModule.QueryParams) {
        const reqUrl = '/admin/abnormal/cause/query';
        const res = await postRequest(reqUrl, params);
        return res;
    },
    /**
     * 删除数据
     * @param params
     * @returns
     */
    async getAbnormalReasonDelete(params: AbnormalReasonModule.DeleteParams) {
        const reqUrl = '/admin/abnormal/cause/delete';
        const res = await postRequest(reqUrl, params);
        return res;
    },
    /**
     * 
     * @returns 
     */
    async getAbnormalList(){
        const reqUrl = '/admin/abnormal/type/list';
        const res = await postRequest(reqUrl);
        return res;
    },
    /**
     * 新增
     * @param params
     * @returns
     */
    async getAbnormalReasonCreate(params: AbnormalReasonModule.CreateParams) {
        const reqUrl = '/admin/abnormal/cause/create';
        const res = await postRequest(reqUrl, params);
        return res;
    },
    /**
     * 修改
     * @param params
     * @returns
     */
    async getAbnormalReasonUpdate(params: AbnormalReasonModule.UpdateParams) {
        const reqUrl = '/admin/abnormal/cause/update';
        const res = await postRequest(reqUrl, params);
        return res;
    },

};

export default abnormalReasonService;
