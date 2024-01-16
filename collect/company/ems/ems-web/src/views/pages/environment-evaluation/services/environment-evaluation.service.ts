import { getCampusParams } from '@/utils/token';
import { postRequest } from '@/services/request';
import url from '@/api/api-url';

interface HttpType {
  endDate: string;
  startDate: string;
  treeId: number | undefined;
}

enum EE_EPath {
  获取折线图数据 = '/environmental/assessment/query', // 折线图
  查询环境评估树节点下拉框数据 = '/environmental/assessment/queryTreeAndPoints',
}

const environment = {
  /**
   * 获取折线图数据
   * @param params
   * @returns
   */
  async queryLineChart(params: HttpType) {
    const res = await postRequest(EE_EPath.获取折线图数据, params);
    return res;
  },

  /**
   * 查询环境评估树节点下拉框数据
   * @param params
   * @returns
   */
  async getEmsTreeInfo() {
    const params = getCampusParams();
    const res = await postRequest(EE_EPath.查询环境评估树节点下拉框数据, params);
    console.log(res);
    return res;
  },
};

export default environment;
