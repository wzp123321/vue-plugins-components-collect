import { postRequest } from '@/services/request';

const energyRatio = {
  /**
   * 获取初始数据；
   */
  async getInitData(params: number) {
    const res = await postRequest('/admin/portal/component/configGet/energyItemRatio', params);
    return res;
  },
  /**
   * 保存数据；
   */
  async saveData(params: {
    componentCode: string;
    id: number;
    componentTitle: string;
    treeId: number;
    treeType: string;
  }) {
    const res = await postRequest('/admin/portal/component/config/energyItemRatio', params);
    return res;
  },
};

export default energyRatio;
