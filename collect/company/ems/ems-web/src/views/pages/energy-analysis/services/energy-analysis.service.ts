import { getCampusParams } from '@/utils/token';
import CommonService from '@/services/common/common.service';
import { postRequest } from '@/services/request';

const EnergyAnalysisService = {
  /**
   * 获取能耗柱状折线图数据
   */
  async getEnergyAnalyseBarChart(param: AnalysisManageModule.GetLineBarChartParam) {
    const res: HttpRequestModule.ResTemplate<AnalysisManageModule.GetLineBarChartRes> = await postRequest(
      '/energyAnalyse/queryEnergyAnalyseBarChart',
      param,
    );
    return res;
  },
  /**
   * 获取能耗钻取数据
   */
  async getEnergyAnalyseDataDrill(param: AnalysisManageModule.GetLineBarChartParam) {
    const p = {
      ...param,
      ...getCampusParams(),
      wholeHospitalFlag: true,
    };
    const res: HttpRequestModule.ResTemplate<AnalysisManageModule.AnalyseDataDrillRes> = await postRequest(
      '/energyAnalyse/queryEnergyAnalyseDataDrill',
      p,
    );
    return res;
  },
  /**
   * 获取能耗分解环形图
   */
  async getEnergyAnalysePieChart(param: AnalysisManageModule.GetLineBarChartParam) {
    const p = {
      ...param,
      ...getCampusParams(),
      wholeHospitalFlag: true,
    };
    const res: HttpRequestModule.ResTemplate<AnalysisManageModule.EnergyAnalysePieChartRes> = await postRequest(
      '/energyAnalyse/queryEnergyAnalysePieChart',
      p,
    );
    return res;
  },
  /**
   * 获取节点下设备
   */
  async getIndexDeviceList(
    param: AnalysisManageModule.GetEnergyCompareParam,
  ): Promise<
    HttpRequestModule.ResTemplate<HttpRequestModule.HttpListResponsive<AnalysisManageModule.IndexDeviceListRes[]>>
  > {
    const res: HttpRequestModule.ResTemplate<
      HttpRequestModule.HttpListResponsive<AnalysisManageModule.IndexDeviceListRes[]>
    > = await postRequest('/energyAnalyse/queryIndexDeviceList', param);
    return res;
  },
  /**
   * 获取节点下设备信息
   */
  async getRealtime(param: any) {
    const res: HttpRequestModule.ResTemplate<AnalysisManageModule.RealtimeRes> = await postRequest(
      '/energyAnalyse/querySingleDevInfo',
      param.treeId,
    );
    return res;
  },
  /**
   * 获取能耗同环比
   */
  async getEnergyCompare(param: AnalysisManageModule.GetEnergyCompareParam) {
    const res: HttpRequestModule.ResTemplate<AnalysisManageModule.EnergyCompareRes> = await postRequest(
      '/energyAnalyse/queryEnergyCompare',
      param,
    );
    return res;
  },
  /**
   * 导出表格
   */
  async exportTable(param: AnalysisManageModule.GetLineBarChartParam, cb: () => void) {
    CommonService.getFileStreamDownload(param, '/energyAnalyse/exportExcelEnergyAnalyse', '导出', cb, cb);
  },
};

export default EnergyAnalysisService;
