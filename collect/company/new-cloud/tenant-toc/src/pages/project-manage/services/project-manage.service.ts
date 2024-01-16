/*
 * @Description:
 * @Autor: zpwan
 * @Date: 2022-04-07 09:43:35
 * @LastEditors: wanzp wanzp@tiansu-china.com
 * @LastEditTime: 2023-10-10 10:56:19
 */
import { postRequest } from '@/service/request';
import {
  TreeRes,
  EnergyCode,
  SearchDetailVO,
  SearchForm,
  SearchDetailParams,
  SearchTreeParams,
} from './project-manage.api';

class ProjectManageService {
  /**
   * 分页查询项目列表
   * @param params 分页参数
   * @returns
   */
  public queryProjectList = async (params: SearchForm) => {
    const url = '/projectManagement/query';
    const res = await postRequest(url, params);
    return res;
  };
  /**
   * 根据租户信息查询项目信息查询
   * @param params 租户信息
   * @returns
   */
  public queryProjectDetailByCodeAndId = async <T>(
    params: SearchDetailParams,
  ): Promise<HttpRequestModule.ResTemplate<T>> => {
    const url = '/projectManagement/queryProjectInfo';
    const res: HttpRequestModule.ResTemplate<T> = await postRequest(url, params);
    return res;
  };
  /**
   * 查询分类分项列表
   * @returns
   */
  public queryAllEnergyCode = async (): Promise<HttpRequestModule.ResTemplate<EnergyCode[]>> => {
    const url = '/projectManagement/queryEnergyCode';
    const res: HttpRequestModule.ResTemplate<EnergyCode[]> = await postRequest(url);
    return res;
  };
  /**
   * 查询树
   * @param params
   * @returns
   */
  public queryTreeByEnergyCode = async (params: SearchTreeParams): Promise<HttpRequestModule.ResTemplate<TreeRes>> => {
    const url = '/tenant/tree/listTreeByEnergyCode';
    const res: HttpRequestModule.ResTemplate<TreeRes> = await postRequest(url, params);
    return res;
  };
  /**
   * 编辑项目
   * @param params
   * @returns
   */
  public getProjectEditor = async (params: SearchDetailVO): Promise<HttpRequestModule.ResTemplate<boolean>> => {
    const url = '/projectManagement/updateProjectInfo';
    const res: HttpRequestModule.ResTemplate<boolean> = await postRequest(url, params);
    return res;
  };
  /**
   * 查询省份列表
   * @returns
   */
  public getProvinceList = async (): Promise<HttpRequestModule.ResTemplate<GeneralModule.DictionaryInfo[]>> => {
    const url = '/projectManagement/getProvinceList';
    const res: HttpRequestModule.ResTemplate<GeneralModule.DictionaryInfo[]> = await postRequest(url);
    return res;
  };
  /**
   * 查询市列表
   * @returns
   */
  public getCityListByProvinceCode = async (
    params: string,
  ): Promise<HttpRequestModule.ResTemplate<GeneralModule.DictionaryInfo[]>> => {
    const url = '/projectManagement/getCityList';
    const res: HttpRequestModule.ResTemplate<GeneralModule.DictionaryInfo[]> = await postRequest(url, params);
    return res;
  };

  /**
   * 查询区县列表
   * @returns
   */
  public getCountyListByCityCode = async (
    params: string,
  ): Promise<HttpRequestModule.ResTemplate<GeneralModule.DictionaryInfo[]>> => {
    const url = '/projectManagement/getDistrictList';
    const res: HttpRequestModule.ResTemplate<GeneralModule.DictionaryInfo[]> = await postRequest(url, params);
    return res;
  };

  /**
   * 获取单价类型
   * @returns
   */
  public getPriceType = async (): Promise<HttpRequestModule.ResTemplate<GeneralModule.DictionaryInfo[]>> => {
    const url = '/tenantDict/detail/queryByCode';
    const res: HttpRequestModule.ResTemplate<GeneralModule.DictionaryInfo[]> = await postRequest(url, 'price_type');
    return res;
  };

  /**
   * 获取绑定项目
   * @returns
   */
  public getBindProject = async (params: SearchDetailParams): Promise<HttpRequestModule.ResTemplate<any>> => {
    const url = '/projectManagement/queryProjects';
    const res: HttpRequestModule.ResTemplate<GeneralModule.DictionaryInfo[]> = await postRequest(url, params);
    return res;
  };
}

export default new ProjectManageService();
