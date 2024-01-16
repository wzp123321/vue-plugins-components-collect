import { getCampusParams } from '@/utils/token';
import { postRequest } from '@/services/request';
import { EA_IActualAnomalyResult, EA_IAnomalyDetail, EA_IBoundaryAnomalyInfo } from '../energy-anomaly.api';
import { EA_ITabAnomalyNum } from '../components/ea-switch-tab/ea-switch-tab.api';

const energyAnomalyService = {
  /**
   * 查询能源树类型表格数据
   */
  async getEnergyTreeTypeData(): Promise<HttpRequestModule.ResTemplate<EnergyAnomalyModule.EnergyTreeType[]>> {
    const url = '/admin/abnormal/treeType/config/queryAll';
    const res: HttpRequestModule.ResTemplate<EnergyAnomalyModule.EnergyTreeType[]> = await postRequest(url);
    return res;
  },
  /**
   * 查询常用分类分项
   */
  async getEnergyCodeList(): Promise<HttpRequestModule.ResTemplate<EnergyAnomalyModule.EnergyCodeInfo[]>> {
    const url = '/abnormal/queryEnergyCodeWithoutParent';
    const res: HttpRequestModule.ResTemplate<EnergyAnomalyModule.EnergyCodeInfo[]> = await postRequest(url);
    return res;
  },
  /**
   * 异常类型列表
   */
  async getAnomalyTypeList(): Promise<HttpRequestModule.ResTemplate<EnergyAnomalyModule.AnomalyType[]>> {
    const url = '/abnormal/queryAbnormalType';
    const res: HttpRequestModule.ResTemplate<EnergyAnomalyModule.AnomalyType[]> = await postRequest(url);
    return res;
  },
  /**
   * 昨日异常--树
   */
  async getAnomalyTreeList(
    params: EnergyAnomalyModule.QueryAnomalyTreeParams,
  ): Promise<HttpRequestModule.ResTemplate<EnergyAnomalyModule.AnomalyTree[]>> {
    const p = {
      ...params,
      ...getCampusParams(),
    };
    const url = '/abnormal/queryAbnormalTreeList';
    const res: HttpRequestModule.ResTemplate<EnergyAnomalyModule.AnomalyTree[]> = await postRequest(url, p);
    return res;
  },
  /**
   * 实时异常--树
   */
  async getRatioAnomalyTreeList(
    params: EnergyAnomalyModule.QueryAnomalyTreeParams,
  ): Promise<HttpRequestModule.ResTemplate<EnergyAnomalyModule.AnomalyTree[]>> {
    const p = {
      ...params,
      ...getCampusParams(),
    };
    const url = '/abnormal/energy/queryAbnormalEnergyTreeList';
    const res: HttpRequestModule.ResTemplate<EnergyAnomalyModule.AnomalyTree[]> = await postRequest(url, p);
    return res;
  },
  /**
   * 边界异常--树
   */
  async getBoundaryAnomalyTreeList(
    params: EnergyAnomalyModule.QueryAnomalyTreeParams,
  ): Promise<HttpRequestModule.ResTemplate<EnergyAnomalyModule.AnomalyTree[]>> {
    const p = {
      ...params,
      ...getCampusParams(),
    };
    const url = '/boundary/energy/queryBoundaryEnergyTreeList';
    const res: HttpRequestModule.ResTemplate<EnergyAnomalyModule.AnomalyTree[]> = await postRequest(url, p);
    return res;
  },
  /**
   * 请求实时异常刷新时间
   * @param params 异常类型 1-用能异常   2-边界异常
   * @returns
   */
  async getActualAnomalyRefreshTime(params: string): Promise<HttpRequestModule.ResTemplate<{ lastTime: string }>> {
    const url = '/abnormal/getLastTime';
    const res: HttpRequestModule.ResTemplate<{ lastTime: string }> = await postRequest(url, params);
    return res;
  },
  /**
   * 请求异常列表
   * @param params
   * @returns
   */
  async getAnomalyList(
    params: EnergyAnomalyModule.QueryAnomalyListParams,
  ): Promise<HttpRequestModule.ResTemplate<EnergyAnomalyModule.AnomalyInfo[]>> {
    const p = {
      ...params,
      ...getCampusParams(),
    };
    const url = '/abnormal/queryAbnormalCardList';
    const res: HttpRequestModule.ResTemplate<EnergyAnomalyModule.AnomalyInfo[]> = await postRequest(url, p);
    return res;
  },
  /**
   * 请求实时异常列表
   * @param params
   * @returns
   */
  async getActualAnomalyList(
    params: EnergyAnomalyModule.QueryAnomalyListParams,
  ): Promise<HttpRequestModule.ResTemplate<EA_IActualAnomalyResult[]>> {
    const p = {
      ...params,
      ...getCampusParams(),
    };
    const url = '/abnormal/energy/queryAbnormalEnergyTreeCardList';
    const res: HttpRequestModule.ResTemplate<EA_IActualAnomalyResult[]> = await postRequest(url, p);
    return res;
  },
  /**
   * 请求边界异常列表
   * @param params
   * @returns
   */
  async getBoundaryAnomalyList(
    params: EnergyAnomalyModule.QueryAnomalyListParams,
  ): Promise<HttpRequestModule.ResTemplate<EA_IActualAnomalyResult[]>> {
    const p = {
      ...params,
      ...getCampusParams(),
    };
    const url = '/boundary/energy/queryBoundaryEnergyCardList';
    const res: HttpRequestModule.ResTemplate<EA_IActualAnomalyResult[]> = await postRequest(url, p);
    return res;
  },
  /**
   * 请求隐藏的异常列表
   * @param params
   * @returns
   */
  async getPersonalHiddenAnomalyList(): Promise<
    HttpRequestModule.ResTemplate<EnergyAnomalyModule.PersonalHiddenAnomalyInfo[]>
  > {
    const params = getCampusParams();
    const url = '/abnormal/queryAbnormalHideTreeCardList';
    const res: HttpRequestModule.ResTemplate<EnergyAnomalyModule.PersonalHiddenAnomalyInfo[]> = await postRequest(
      url,
      params,
    );
    return res;
  },
  /**
   * 取消隐藏异常
   * @param params
   * @returns
   */
  async getPersonalHiddenAnomalyListCancel(params: number): Promise<HttpRequestModule.ResTemplate<boolean>> {
    const url = '/abnormal/deleteAbnormalHideData';
    const res: HttpRequestModule.ResTemplate<boolean> = await postRequest(url, params);
    return res;
  },
  /**
   * 新增或编辑异常
   * @param params
   * @returns
   */
  async getPersonalHiddenAnomalyAddOrUpdate(
    params: EnergyAnomalyModule.CancelHideCardParams,
  ): Promise<HttpRequestModule.ResTemplate<boolean>> {
    const url = '/abnormal/saveAbnormalHideData';
    const res: HttpRequestModule.ResTemplate<boolean> = await postRequest(url, params);
    return res;
  },
  /**
   * 异常详情
   * @param params
   * @returns
   */
  async getPersonalAnomalyDetail(
    params: EnergyAnomalyModule.QueryAnomalyListParams,
  ): Promise<HttpRequestModule.ResTemplate<EA_IAnomalyDetail>> {
    const url = '/abnormal/queryAbnormalTreeCardDetail';
    const res: HttpRequestModule.ResTemplate<EA_IAnomalyDetail> = await postRequest(url, params);
    return res;
  },
  /**
   * 边界异常详情
   * @param params
   * @returns
   */
  async getBoundaryAnomalyDetail(
    params: EnergyAnomalyModule.QueryAnomalyListParams,
  ): Promise<HttpRequestModule.ResTemplate<EA_IBoundaryAnomalyInfo>> {
    const url = '/boundary/energy/queryBoundaryCardDetail';
    const res: HttpRequestModule.ResTemplate<EA_IBoundaryAnomalyInfo> = await postRequest(url, params);
    return res;
  },
  /**
   * 异常处理  operateType写死为3
   */
  async getAbnormalDeal(params: {
    alarmId: number;
    handleRemarks: string;
    operateType: string;
  }): Promise<HttpRequestModule.ResTemplate<boolean>> {
    const url = '/abnormal/operateAlarm';
    const res: HttpRequestModule.ResTemplate<boolean> = await postRequest(url, params);
    return res;
  },
  /**
   * 查询已处理的异常
   * @param params
   * @returns
   */
  async getDealedAbnormalCardList(
    params: EnergyAnomalyModule.ProcessedAbnormalParams,
  ): Promise<HttpRequestModule.ResTemplate<EnergyAnomalyModule.ProcessedAbnormalInfo[]>> {
    const p = {
      ...params,
      ...getCampusParams(),
    };
    const url = '/abnormal/queryAbnormalAlarmCardList';
    const res: HttpRequestModule.ResTemplate<EnergyAnomalyModule.ProcessedAbnormalInfo[]> = await postRequest(url, p);
    return res;
  },
  /**
   * 查询各tab的异常数量
   * @param params
   * @returns
   */
  async getTabAbnormalNumber(): Promise<HttpRequestModule.ResTemplate<EA_ITabAnomalyNum>> {
    const params = getCampusParams();
    const url = '/abnormal/queryAlarmTotalNumber';
    const res: HttpRequestModule.ResTemplate<EA_ITabAnomalyNum> = await postRequest(url, params);
    return res;
  },
  /**
   * 触发边界异常
   * @param params
   * @returns
   */
  async getBoundarySaveTriggle(params: {
    id: number;
    alarmId: number;
    triggerFlag: string;
    handleRemarks: string | null;
  }): Promise<HttpRequestModule.ResTemplate<number>> {
    const url = '/boundary/energy/trigger';
    const res: HttpRequestModule.ResTemplate<number> = await postRequest(url, params);
    return res;
  },
};

export default energyAnomalyService;
