import { postRequest } from '@/services/request';

enum BM_EPath {
  queryBenchmarkingTabData = '/query/config/benchmarking/children/arch/page', // 获取快捷配置入口表格数据
  deleteStandardSys = '/delete/config/benchmarking/arch', // 删除对标体系表格数据
  updateBenchmarkValue = '/update/config/benchmarking/arch', // 更新对标体系表格数据
  queryAllFatherSystemData = '/query/config/benchmarking/arch', // 查询所有父体系
  addFatherSystem = '/add/config/benchmarking/parent/arch', // 新增父体系
  queryFatherId = '/query/config/benchmarking/arch/byName', // 通过名字查询父体系id
  addSonSystem = '/add/config/benchmarking/arch', // 新增子体系
  queryArchType = '/query/config/benchmarking/arch/type', // 查询指标类型
}

const BenchmarkingManage = {
  /**
   * 获取表格数据
   * @param params
   * @returns
   */
  async getBenchmarkingTabData(
    params: any,
  ): Promise<
    HttpRequestModule.ResTemplate<HttpRequestModule.HttpListResponsive<BenchMarkingManage.BenchMarkingDetail[]>>
  > {
    const res: HttpRequestModule.ResTemplate<
      HttpRequestModule.HttpListResponsive<BenchMarkingManage.BenchMarkingDetail[]>
    > = await postRequest(BM_EPath.queryBenchmarkingTabData, params);
    return res;
  },
  /**
   * 删除
   */
  async deleteStandardSys(params: any) {
    const res: HttpRequestModule.ResTemplate<any> = await postRequest(BM_EPath.deleteStandardSys, params);
    return res;
  },
  /**
   * 编辑更新
   */
  async updateBenchmarkValue(params: { benchmarkValue: number; id: number; name: null }) {
    const res: HttpRequestModule.ResTemplate<any> = await postRequest(BM_EPath.updateBenchmarkValue, params);
    return res;
  },
  /**
   * 点击新增按钮查询所有父体系
   */
  async queryAllFatherSystem(params: any) {
    const res: HttpRequestModule.ResTemplate<any> = await postRequest(BM_EPath.queryAllFatherSystemData, params);
    return res;
  },
  /**
   * 新增父体系
   */
  async addFatherSystem(params: any) {
    const res: HttpRequestModule.ResTemplate<any> = await postRequest(BM_EPath.addFatherSystem, params);
    return res;
  },
  /**
   * 新增子体系
   */
  async addSonSystem(params: any) {
    const res: HttpRequestModule.ResTemplate<any> = await postRequest(BM_EPath.addSonSystem, params);
    return res;
  },
  /**
   * 根据name查询父体系id
   */
  async queryFatherIdByName(params: any) {
    const res: HttpRequestModule.ResTemplate<any> = await postRequest(BM_EPath.queryFatherId, params);
    return res;
  },
  /**
   * 查询新增子体系弹框中的指标类型
   */
  async queryArchType() {
    const res: HttpRequestModule.ResTemplate<any> = await postRequest(BM_EPath.queryArchType);
    return res;
  },
};

export default BenchmarkingManage;
