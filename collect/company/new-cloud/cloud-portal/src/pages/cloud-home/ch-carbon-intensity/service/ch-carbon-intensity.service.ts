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
  查询碳排放强度 = '/operationCenter/queryCarbonEmissionIntensity',
}
class ChCarbonIntensityService {
  public queryCarbonEmissionIntensity = async (): Promise<any> => {
    const url = EPath.查询碳排放强度;
    try {
      const res = await axios.post(url);
      return res;
    } catch (error) {
      console.warn('碳排放强度', '-->', error);
    }
  };
}

export default new ChCarbonIntensityService();
