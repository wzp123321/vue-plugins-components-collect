/*
 * @Description:
 * @Autor: kongx
 * @Date: 2022-05-19 09:43:35
 * @LastEditors: kongx
 * @LastEditTime: 2022-05-19 21:00:00
 */
import axios from 'axios';

// 后台接口地址
const enum EPath {
  查询节能概览 = '/operationCenter/queryEnergySavingOverview',
}
class ChCarbonIntensityService {
  public queryEnergySavingOverview = async (): Promise<any> => {
    const url = EPath.查询节能概览;
    try {
      const res = await axios.post(url);
      return res;
    } catch (error) {
      console.warn('节能概览', '-->', error);
    }
  };
}

export default new ChCarbonIntensityService();
