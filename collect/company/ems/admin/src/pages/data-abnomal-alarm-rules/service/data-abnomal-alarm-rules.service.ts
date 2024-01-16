import { postRequest } from '@/services/request';

const abnomalAlarmRulesService = {
  /**
   * 查询能耗分析表格数据
   * @param params
   * @returns
   */
  async getEngAlyTab() {
    const reqUrl = '/admin/alarm/energy/analyse/config/queryAll';
    const res = await postRequest(reqUrl);
    return res;
  },
  /**
   * 查询数据着色表格数据
   * @param params
   * @returns
   */
  async getDataColTab() {
    const reqUrl = '/admin/data/color/config/queryAll';
    const res = await postRequest(reqUrl);
    return res;
  },
  /**
   * 查询告警起点---分类分项
   * @param params
   * @returns
   */
  async getFirstAlarmStart() {
    const reqUrl = '/admin/energy/code/listEnergyParentCodeExcludeTotal';
    const res = await postRequest(reqUrl);
    return res;
  },
  /**
   * 查询告警起点配置
   * @param params
   * @returns
   */
  async getAlarmStartData() {
    const reqUrl = '/admin/global/alarm/deadband/config/queryAll';
    const res = await postRequest(reqUrl);
    return res;
  },
  /**
   * 查询告警规则表格数据
   * @param params
   * @returns
   */
  async getAlarmRulesTab() {
    const reqUrl = '/admin/global/alarm/threshold/config/queryAll';
    const res = await postRequest(reqUrl);
    return res;
  },
  /**
   * 查询能源异常表格数据
   * @param params
   * @returns
   */
  async getEngAbnormalTab() {
    const reqUrl = '/admin/abnormal/threshold/config/queryAll';
    const res = await postRequest(reqUrl);
    return res;
  },
  /**
   * 查询日志表格数据
   * @param params
   * @returns
   */
  //能耗分析日志
  async getEngAlyLogData(params: AbnomalAlarmRulesHttp.GetLogData) {
    const reqUrl = '/admin/alarm/energy/analyse/config/query/logs';
    const res = await postRequest(reqUrl, params);
    return res;
  },
  //告警规则日志
  async getAlarmRulesLogData(params: AbnomalAlarmRulesHttp.GetLogData) {
    const reqUrl = '/admin/global/alarm/threshold/config/query/logs';
    const res = await postRequest(reqUrl, params);
    return res;
  },
  //告警规则--能源异常日志
  async getEnergyAbnormalLogData(params: AbnomalAlarmRulesHttp.GetLogData) {
    const reqUrl = '/admin/abnormal/threshold/config/query/logs';
    const res = await postRequest(reqUrl, params);
    return res;
  },
  //能源异常树类型日志
  async getEnergyTreeTypeLogData(params: AbnomalAlarmRulesHttp.GetLogData) {
    const reqUrl = '/admin/abnormal/treeType/config/query/logs';
    const res = await postRequest(reqUrl, params);
    return res;
  },
  /**
   * 查询字典dict数据
   * @param params
   * @returns
   */
  async getDictData(params: string) {
    const reqUrl = '/dict/query';
    const res = await postRequest(reqUrl, params);
    return res;
  },
  /**
   * 保存告警起点数据
   * @param params
   * @returns
   */
  async saveAlarmStartData(params: AbnomalAlarmRulesHttp.SaveAlarmStartData) {
    const reqUrl = '/admin/global/alarm/deadband/config/update/list';
    const res = await postRequest(reqUrl, params);
    return res;
  },

  /**
   * 更新能耗分析
   * @param params
   * @returns
   */
  async updatedEngAylData(params: AbnomalAlarmRulesHttp.UpdatedEngAlyData) {
    const reqUrl = '/admin/alarm/energy/analyse/config/update';
    const res = await postRequest(reqUrl, params);
    return res;
  },
  /**
   * 更新数据着色
   * @param params
   * @returns
   */
  async updatedDataColor(params: AbnomalAlarmRulesHttp.UpdatedDataColor) {
    const reqUrl = '/admin/data/color/config/update';
    const res = await postRequest(reqUrl, params);
    return res;
  },
  /**
   * 更新告警规则-告警阈值
   * @param params
   * @returns
   */
  async updatedAlarmRulesData(params: AbnomalAlarmRulesHttp.UpdatedAlarmRulesData) {
    const reqUrl = '/admin/global/alarm/threshold/config/update';
    const res = await postRequest(reqUrl, params);
    return res;
  },
  /**
   * 更新能源异常树类型
   * @param params
   * @returns
   */
  async updatedEnergyTreeTypeData(params: AbnomalAlarmRulesHttp.UpdatedAlarmRulesData) {
    const reqUrl = '/admin/abnormal/treeType/config/update';
    const res = await postRequest(reqUrl, params);
    return res;
  },
  /**
   * 更新告警规则-能源异常
   * @param params
   * @returns
   */
  async updatedEngAbnormalData(params: AbnomalAlarmRulesHttp.UpdatedEngAbnormalData) {
    const reqUrl = '/admin/abnormal/threshold/config/update';
    const res = await postRequest(reqUrl, params);
    return res;
  },
};
export default abnomalAlarmRulesService;
