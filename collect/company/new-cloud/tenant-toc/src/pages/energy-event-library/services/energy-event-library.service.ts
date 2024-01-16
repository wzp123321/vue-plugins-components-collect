import { getRequest, postRequest } from '@/service/request';

import { EnergyEventSearchForm } from '../constant/options';

import { EnergyEventLibraryListDeatil, EnergyEventLibraryCardList } from './energy-event-library.service.api';
/*
 * @Description:
 * @Autor: kongx
 * @Date: 2022-05-12 09:43:35
 * @LastEditors: kongx
 * @LastEditTime: 2022-05-12 18:57:27
 */
class EnergyEventLibraryService {
  /**
   * 分页查询项目列表
   * @param params 分页参数
   * @returns
   */
  public queryEnergyEventLibraryList = async (params: EnergyEventSearchForm) => {
    const url = '/energyEvent/queryRecords';
    const res = await postRequest(url, params);
    return res;
  };

  /**
   * 项目列表每条详情
   * @param params 详情唯一标识id
   * @returns
   */
  public queryEnergyEventLibraryListDeatil = async (params: EnergyEventLibraryListDeatil) => {
    const url = '/energyEvent/queryEventDetail';
    const res = await getRequest(url, params);
    return res;
  };

  /**
   * 卡片
   * @param params 查询卡片的年份
   * @returns
   */
  public queryEnergyEventLibraryCardList = async (params: EnergyEventLibraryCardList) => {
    const url = '/energyEvent/queryCardList';
    const res = await getRequest(url, params);
    return res;
  };

  /**
   * table表导出
   * @param params 导出的年份
   * @returns
   */
  public queryExportFileYear = async (params: string) => {
    const url = '/energyEvent/export';
    const res = await postRequest(url, params, {
      responseType: 'blob',
    });
    return res;
  };
}

export default new EnergyEventLibraryService();
