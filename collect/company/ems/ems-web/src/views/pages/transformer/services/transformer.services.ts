import { postRequest } from '@/services/request';

const TransformerService = {
  /**
   * 获取单个设备数据
   */
  async getSigleTransData(param: any) {
    const res: HttpRequestModule.ResTemplate<TransformerModule.SingleResponse> = await postRequest(
      '/transformer/sigleTransObj/detail',
      param,
    );
    return res;
  },
  /**
   * 获取多个设备数据
   */
  async getMultiTransData(param: TransformerModule.QueryParams) {
    const res: HttpRequestModule.ResTemplate<TransformerModule.MultiResponse> = await postRequest(
      '/transformer/multiTransObj/chartsAndTable',
      param,
    );
    return res;
  },
  /**
   * 获取多个设备数据
   */
  async getTransformerData(param: TransformerModule.QueryParams) {
    const res: HttpRequestModule.ResTemplate<TransformerModule.SingleResponse> = await postRequest(
      '/transformer/shower/multi/details',
      param,
    );
    return res;
  },
  /**
   * 获取能效节点树内容
   */
  async getTransformerTreeData() {
    const res: HttpRequestModule.ResTemplate<TransformerModule.TreeNode[]> = await postRequest(
      '/transformer/shower/multi/transformer',
    );
    return res;
  },
  /**
   * 获取公共参数
   */
  async getParamData(param: TransformerModule.QueryParams) {
    const res: HttpRequestModule.ResTemplate<TransformerModule.ParamInfo[]> = await postRequest(
      '/transformer/shower/multi/transformer/param',
      param,
    );
    return res;
  },
};

export default TransformerService;
