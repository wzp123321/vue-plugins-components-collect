import { postRequest } from '@/services/request';

export const pointService = {
  /**
   * 查询站点列表
   * @param params
   * @returns
   */
  async getConcentratorList(params: any): Promise<HttpRequestModule.ResTemplate<ConcentratorItem[]>> {
    const res = await postRequest('/admin/tree/bind/point/feign/concentrators', params);
    return res;
  },

  /**
   * 查询设备列表
   * @param params
   * @returns
   */
  async getDeviceList(param: any): Promise<HttpRequestModule.ResTemplate<DeviceItem[]>> {
    const res = await postRequest('/admin/tree/bind/point/feign/concentrator/devices', param);
    return res;
  },

  /**
   * 查询点位列表
   * @param params
   * @returns
   */
  async getPointList(param: QueryParams): Promise<HttpRequestModule.ResTemplate<PointItem[]>> {
    const res = await postRequest('/admin/tree/bind/point/feign/device/points', param);
    return res;
  },
};

export interface ConcentratorItem {
  comStatus: string;
  id: number;
  ipAddress: string;
  linkHostIp: string;
  linkHostPort: number;
  location: string;
  logicAddress: number;
  name: string;
  siteProtocolCode: string;
  supplier: string;
  tenantCode: string;
}
export interface DeviceItem {
  id: number;
  name: string;
}

export interface PointItem {
  concentratorId: number;
  concentratorName: string;
  deviceId: number;
  deviceName: string;
  deviceTypeCode: string;
  id: number;
  name: string;
  operationType: string;
  pointNumber: number;
  pointType: string;
  standardPointCode: string;
  systemCategory: string;
  unit: string;
  value: number;
}

export interface Adssa_PointItem {
  id: string;
  name: string;
  standardPointCode?: string;
}

export interface QueryParams {
  energyCode: string;
  id: string;
}

export interface SelectedPoint {
  concentratorId: string;
  concentratorName: string;
  deviceId: string;
  deviceName: string;
  pointNumberName: string;
  pointNumber: string;
  standardPointCode: string;
}
