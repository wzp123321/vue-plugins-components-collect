import { postRequest } from '@/services/request';

const EnergyCodeService = {
  async getAllEnergyCodeTree(): Promise<
    HttpRequestModule.ResTemplate<EnergyCodeManageModule.EnergyInfo[]>
  > {
    const reqUrl = '/admin/energy/code/queryEnergyAsTree';
    const res: HttpRequestModule.ResTemplate<EnergyCodeManageModule.EnergyInfo[]> = await postRequest(
      reqUrl,
    );
    return res;
  },
  /**
   * 查询全部分类分项
   * @returns
   */
  async getAllEnergyCodeList(): Promise<
    HttpRequestModule.ResTemplate<Array<{ code: string; name: string }>>
  > {
    const reqUrl = '/admin/energy/code/list';
    const res: HttpRequestModule.ResTemplate<Array<{
      code: string;
      name: string;
    }>> = await postRequest(reqUrl);
    return res;
  },
  /**
   * 查询计入能耗分类分项顶级节点
   * @returns
   */
  async getEnergyTopLevelList(): Promise<
    HttpRequestModule.ResTemplate<Array<{ code: string; name: string }>>
  > {
    const reqUrl = '/admin/energy/code/listEnergyParentCode';
    const res: HttpRequestModule.ResTemplate<Array<{
      code: string;
      name: string;
    }>> = await postRequest(reqUrl);
    return res;
  },
};

export default EnergyCodeService;
