import { postRequest } from '@/services/request';

const enum Epath {
  查询科室树指标数据 = '/admin/benchmarking/correlation/data/departmentTrees',
  新增科室树指标数据 = '/admin/benchmarking/correlation/departmentData/save',
}

const indicator = {
  /**
   * 获取主体数据
   * @param params
   * @returns
   */
  async queryTreeData(params: IndicatorDataMaintenance.queryDepartmentTreeDataType) {
    const res = await postRequest('/admin/benchmarking/correlation/data/trees', params);
    return res;
  },

  /**
   * 获取科室树数据
   * @param params
   * @returns
   */
  async queryDepartmentTreeData(params: IndicatorDataMaintenance.queryTreeDataType) {
    const res = await postRequest(Epath.查询科室树指标数据, params);
    return res;
  },

  /**
   * 编辑主体数据
   * @param params
   * @returns
   */
  async saveData(params: IndicatorDataMaintenance.saveDataType) {
    const res = await postRequest('/admin/benchmarking/correlation/data/save', params);
    return res;
  },

  /**
   * 编辑科室树数据
   * @param params
   * @returns
   */
  async saveDepartmentData(params: IndicatorDataMaintenance.saveDataType) {
    const res = await postRequest(Epath.新增科室树指标数据, params);
    return res;
  },

  /**
   * 导入表格
   */
  async uploadTree(params: any) {
    const res = await postRequest('/admin/benchmarking/correlation/data/upload/template', params);
    return res;
  },
};

export default indicator;
