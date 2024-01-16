import { postRequest } from '@/service/request';

class HouseholdnumberService {
  /**
   * 通用查询头部分类分项
   * @param params
   * @returns
   */
  public queryEnergyCodeList = async (
    params: GeneralModule.TenantVO,
  ): Promise<HttpRequestModule.ResTemplate<NHouseholdNumber.EnergyCodeVO[]>> => {
    const url = '/baseHead/queryEnergyType';
    const res: HttpRequestModule.ResTemplate<NHouseholdNumber.EnergyCodeVO[]> = await postRequest(url, params);
    return res;
  };
  /**
   * 查询列表
   * @param params
   * @returns
   */
  public getHouseholdnumberList = async (
    params: NHouseholdNumber.SearchParams,
  ): Promise<
    HttpRequestModule.ResTemplate<HttpRequestModule.HttpListResponsive<NHouseholdNumber.AccountNumberInfo[]>>
  > => {
    const url = '/tenant/account/data/page';
    const res: HttpRequestModule.ResTemplate<
      HttpRequestModule.HttpListResponsive<NHouseholdNumber.AccountNumberInfo[]>
    > = await postRequest(url, params);
    return res;
  };
  /**
   * 根据分类分项 时间 查询账期
   * @param params
   * @returns
   */
  public getBillTimeByEnergyCode = async (
    params: NHouseholdNumber.QueryBillTimeParams,
  ): Promise<HttpRequestModule.ResTemplate<NHouseholdNumber.BillTimeVO>> => {
    const url = '/tenant/account/data/queryBillDate';
    const res: HttpRequestModule.ResTemplate<NHouseholdNumber.BillTimeVO> = await postRequest(url, params);
    return res;
  };
  /**
   * 新增
   * @param params
   * @returns
   */
  public getHouseholdNumberCreate = async (params: FormData): Promise<HttpRequestModule.ResTemplate<number>> => {
    const url = '/tenant/account/data/create';
    const res: HttpRequestModule.ResTemplate<number> = await postRequest(url, params);
    return res;
  };
  /**
   * 编辑
   * @param params
   * @returns
   */
  public getHouseholdNumberEditor = async (params: FormData): Promise<HttpRequestModule.ResTemplate<number>> => {
    const url = '/tenant/account/data/update';
    const res: HttpRequestModule.ResTemplate<number> = await postRequest(url, params);
    return res;
  };
  /**
   * 导入数据
   */
  public getDataImport = async (
    params: any,
  ): Promise<HttpRequestModule.ResTemplate<NHouseholdNumber.ImportExceptionVO[]>> => {
    const url = '/tenant/account/data/upload';
    const res: HttpRequestModule.ResTemplate<NHouseholdNumber.ImportExceptionVO[]> = await postRequest(url, params);
    return res;
  };
  /**
   * 根据id批量查询urk
   */
  public getBatchUrlByIds = async (params: number[]): Promise<string[]> => {
    const url = '/tenant/file/getFileUrlList';
    const res: HttpRequestModule.ResTemplate<string[]> = await postRequest(url, params);
    return res.data ?? [];
  };
  /**
   * 单个文件下载
   * @param params
   * @returns
   */
  public getFileDownloadByFileId = async (params: {
    fileId: number;
  }): Promise<HttpRequestModule.ResTemplate<number>> => {
    const url = '/tenant/file/downloadFile';
    const res: HttpRequestModule.ResTemplate<number> = await postRequest(url, params);
    return res;
  };
}

export default new HouseholdnumberService();
