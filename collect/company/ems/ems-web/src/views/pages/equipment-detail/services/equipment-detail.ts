import { postRequest } from '@/services/request';

enum ED_EPath {
  queryDataUrl = '/deviceDetail/queryHavcSystemDeviceCardList', // 获取卡片数据
  querySelectUrl = '/deviceDetail/queryHavcSystemDeviceTypeList', // 获取设备下拉数据
  queryListUrl = '/deviceDetail/selectHavcSystemDevicePage', // 获取表格数据
}

const equipmentDetail = {
  /**
   * 查询卡片数据
   * @param params
   * @returns
   */
  async getDataUrl(): Promise<
    HttpRequestModule.ResTemplate<
      Array<{
        cardName: string;
        cardCount: number;
      }>
    >
  > {
    const res: HttpRequestModule.ResTemplate<
      Array<{
        cardName: string;
        cardCount: number;
      }>
    > = await postRequest(ED_EPath.queryDataUrl);
    return res;
  },
  /**
   * 查询设备下拉选项数据
   * @param params
   * @returns
   */
  async getSelectUrl(): Promise<
    HttpRequestModule.ResTemplate<
      Array<{
        typeName: string;
        typeId: number;
      }>
    >
  > {
    const res: HttpRequestModule.ResTemplate<
      Array<{
        typeName: string;
        typeId: number;
      }>
    > = await postRequest(ED_EPath.querySelectUrl);
    return res;
  },

  /**
   * 查询列表
   * @param params
   * @returns
   */
  async getListUrl(params: equipmentDetailHttp.getListUrlType) {
    const res = await postRequest(ED_EPath.queryListUrl, params);
    return res;
  },
};

export default equipmentDetail;
