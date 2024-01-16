import { postRequest } from '@/services/request';
const timeTableService = {
  /**
   * 周作息-获取列表
   * @param params
   * @returns
   */
  async getWeekTimeTableList(params: number):
    Promise<HttpRequestModule.ResTemplate<TimeTableModule.WeekTimeTableInfo[]>> {
    const res: HttpRequestModule.ResTemplate<TimeTableModule.WeekTimeTableInfo[]> =
      await postRequest('/admin/weekly/time/query', params);
    return res;
  },
  /**
   * 周作息-更改列表
   * @param params
   * @returns
   */

  async getWeekTimaTableUpdate(params: TimeTableModule.WeekTimeTableCreateParams[]) {
    const res =
      await postRequest('/admin/weekly/time/update', params);
    return res;
  },

  // 特殊作息
  /**
    * 获取列表
    * @param params
    * @returns
    */
  async getSpecialTimeTableList(params: TimeTableModule.SpecialQueryForm) {
    const res = await postRequest('/special/time/query', params);
    return res;
  },
  /**
   * 新增特殊作息列表
   * @param params
   * @returns
   */
  async getSpecialTimeTableAdd(params: any) {
    const res = await postRequest('/special/time/add', params);
    return res;
  },
  /**
   * 删除特殊作息
   * @param params
   * @returns
   */
  async getSpecialTimeTableDelete(params: number) {
    const url = '/special/time/delete';
    const res = await postRequest(url, params);
    return res;
  },
  /**
   * 更改特殊作息
   * @param params
   * @returns
   */
  async getSpecialTimeTableUpdate(params: any) {
    const res = await postRequest('/special/time/update', params);
    return res;
  },
};

export default timeTableService;
