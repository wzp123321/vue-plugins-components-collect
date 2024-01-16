import { postRequest } from '@/services/request';
import { getCampusParams } from '@/utils/token';

enum KM_EPath {
  querytree = '/kpimanage/querytree', // 获取管理树数据
  querydata = '/kpimanage/querydata', // 获取主体数据
}

const KPIManagement = {
  /**
   * 管理树
   * @param params
   * @returns
   */
  async querytree(params: { quotaDate: string; quotaType: number; treeType: number }) {
    const p = {
      ...params,
      ...getCampusParams(),
    };
    const res = await postRequest(KM_EPath.querytree, p);
    return res;
  },
  /**
   * 主体数据
   * @param params
   * @returns
   */
  async querydata(params: { quotaDate: string; quotaType: number; treeId: number }) {
    const res = await postRequest(KM_EPath.querydata, params);
    return res;
  },
};

export default KPIManagement;
