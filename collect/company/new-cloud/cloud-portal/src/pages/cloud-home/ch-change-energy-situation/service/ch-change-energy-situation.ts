/*
 * @Description:
 * @Autor: kongx
 * @Date: 2022-05-23 09:43:35
 * @LastEditors: kongx
 * @LastEditTime: 2022-05-23 21:00:00
 */
import axios from 'axios';

// 后台接口地址
const enum EPath {
  节能技改概览 = '/operationCenter/queryCloudEnergySavingOverview',
}
class ChChangeEnergySituationService {
  public queryOverview = async (): Promise<any> => {
    const url = EPath.节能技改概览;
    try {
      const res = await axios.post(url);
      return res;
    } catch (error) {
      console.warn('技能技改概览', '-->', error);
    }
  };
}

export default new ChChangeEnergySituationService();
