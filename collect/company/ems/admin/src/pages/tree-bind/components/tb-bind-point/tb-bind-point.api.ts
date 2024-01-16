/*
 * @Author: yut
 * @Date: 2024-01-09 14:05:22
 * @LastEditors: yut
 * @LastEditTime: 2024-01-09 16:29:24
 * @Descripttion:
 */

export enum EPath {
  获取集中器数据 = '/admin/tree/bind/point/feign/concentrators',
  根据集中器ID获取设备列表 = '/admin/tree/bind/point/feign/concentrator/devices',
  根据设备ID获取点位列表 = '/admin/tree/bind/point/feign/device/points',
}

//公共对象
export interface Tb_IDataListObj<T> {
  loading: boolean; //加载状态
  checkedId: number; //当前选中的index
  dataList: T; //数据列表
}

//公共分项
export interface Tb_ICommonVO {
  id: number;
  name: string;
}

//获取设备
export interface Tb_IGetDeviceParams {
  standardPointCode: string;
  concentratorId: number;
}

//获取点位
export interface Tb_IGetPointParams {
  energyCode: string;
  id: number;
}

//点位信息
export interface Tb_IPointInfoListInfo {
  id: number;
  deviceId: number;
  deviceName: string;
  deviceTypeCode: string;
  systemCategory: null;
  concentratorId: number;
  concentratorName: string;
  pointType: string;
  standardPointCode: string;
  pointNumber: number;
  name: string;
  unit: string;
  offset: number;
  negationFlag: string;
  operationType: string;
  value: null;
  isChecked:boolean;
}
