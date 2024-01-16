import { postRequest } from '@/services/request';

const equipmentDetailInfoService = {
  /**
   * 获取设备基本信息
   * @param params
   */
  async getEquipmentDetail(params: string) {
    const url = '/deviceDetail/getHavcSystemDeviceDetailVO';
    const res = await postRequest(url, params);
    return res;
  },
  /**
   * 获取设备图表数据
   * @param params
   */
  async getEquipmentChartData(params: IEquipmentDetailInfo.QueryParams) {
    const url = '/deviceDetail/getHavcSystemChartVO';
    const res = await postRequest(url, params);
    return res;
  },
  /**
   * 获取设备表格数据
   * @param params
   */
  async getEquipmentTableData(params: IEquipmentDetailInfo.QueryParams) {
    const url = '/deviceDetail/getHavcSystemTableVO';
    const res = await postRequest(url, params);
    return res;
  },
};

export default equipmentDetailInfoService;
