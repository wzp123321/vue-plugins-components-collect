import { postRequest } from '@/services/request';
const thresholdConfigService = {
    /**
     * 获取配置列表
     */
    async getThresholdCOnfigList(): Promise<
        HttpRequestModule.ResTemplate<
            HttpRequestModule.HttpListResponsive<ThresholdConfigModule.TableListItem[]>
        >
    > {
        const res: HttpRequestModule.ResTemplate<HttpRequestModule.HttpListResponsive<
            ThresholdConfigModule.TableListItem[]
        >> = await postRequest('/admin/abnormal/threshold/config/queryAll');
        return res;
    },
    /**
     * 修改阈值信息
     * @param params
     * @returns
     */
    async getThresholdCOnfigUpdate(params: ThresholdConfigModule.UpdateThresholdConfigValueParam) {
        const res: any = await postRequest('/admin/abnormal/threshold/config/update', params);
        return res;
    },
};
export default thresholdConfigService;
