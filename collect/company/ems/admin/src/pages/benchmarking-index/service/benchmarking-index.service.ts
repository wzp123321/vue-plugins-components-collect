import { postRequest } from '@/services/request';

const benchMarkingIndex = {
    /**
     * 查询列表 对标指标
     * @param params
     * @returns
     */
    async getListUrl(params: benchMarkingIndexHttp.getListUrlType) {
        const res = await postRequest('/admin/benchmarking/index/query', params);
        return res;
    },
    /**
     * 删除数据 对标指标
     * @param params
     * @returns
     */
    async deleteUrl(params: benchMarkingIndexHttp.deleteUrlType) {
        const res = await postRequest('/admin/benchmarking/index/delete', params);
        return res;
    },
    /**
     * 根据指标id查询有无数据
     * @param params
     * @returns
     */
    async queryBenchmarkingIsDataUrl(params:number) {
        const res = await postRequest('/admin/benchmarking/index/data/list', params);
        return res;
    },

    /**
     * 新增 对标指标
     * @param params
     * @returns
     */
    async addurl(params: any) {
        const res = await postRequest('/admin/benchmarking/index/create', params);
        return res;
    },
    /** 
     * 修改 对标指标
     * @param params
     * @returns
     */
    async updateUrl(params: any) {
        const res = await postRequest('/admin/benchmarking/index/update', params);
        return res;
    },


    /**
     * 查询列表 关联指标
     * @param params
     * @returns
     */
     async getCorrelationIndexListUrl(params: benchMarkingIndexHttp.getListUrlType) {
        const res = await postRequest('/admin/benchmarking/correlation/index/query', params);
        return res;
    },
    /**
     * 删除数据 关联指标
     * @param params
     * @returns
     */
    async deleteCorrelationIndexUrl(params: benchMarkingIndexHttp.deleteUrlType) {
        const res = await postRequest('/admin/benchmarking/correlation/index/delete', params);
        return res;
    },
    /**
     * 获取关联指标列表
     * @param params
     * @returns
     */
    async queryCorrelationIndexListUrl() {
        const res = await postRequest('/admin/benchmarking/correlation/index/list');
        return res;
    },

    /**
     * 新增 关联指标
     * @param params
     * @returns
     */
    async addCorrelationIndexurl(params: any) {
        const res = await postRequest('/admin/benchmarking/correlation/index/create', params);
        return res;
    },
    /** 
     * 修改 关联指标
     * @param params
     * @returns
     */
    async updateCorrelationIndexUrl(params: any) {
        const res = await postRequest('/admin/benchmarking/correlation/index/update', params);
        return res;
    },

      /**
     * 根据指标id查询有无数据
     * @param params
     * @returns
     */
       async queryCorrelationIsDataUrl(params:number) {
        const res = await postRequest('/admin/benchmarking/correlation/index/data/list', params);
        return res;
    },

};

export default benchMarkingIndex;
