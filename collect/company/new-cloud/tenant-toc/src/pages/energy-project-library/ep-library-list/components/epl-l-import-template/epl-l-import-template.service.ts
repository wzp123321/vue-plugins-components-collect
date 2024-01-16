import { postRequest } from '@/service/request';

import { IKeyValue } from './epl-l-import-template.api';
enum EPath {
  查询省份列表 = 'projectManagement/getProvinceList',
  查询医院列表 = 'energyProjectLibrary/selectList',
  查询新增医院列表 = 'energyProjectLibrary/getHospitalByProvinceForAdd',
  导入综能项目文件数据 = 'energyProjectLibrary/uploadEnergyProjectLibraryExcel',
}
class ImportEnergeBenchmarkLibraryService {
  /**
   * 导入综能项目文件数据
   * @param { params } 文件对象
   */
  public uploadBenchmarkingData = async (params: any) => {
    const res = await postRequest(EPath.导入综能项目文件数据, params);
    return res;
  };

  public queryProvinceList = async (): Promise<HttpRequestModule.ResTemplate<IKeyValue[]>> => {
    const res = await postRequest(EPath.查询省份列表);
    return res;
  };

  public queryHospitalNameList = async (param: any) => {
    const res = await postRequest(EPath.查询医院列表, param);
    return res;
  };

  public queryNewHospitalNameList = async (param: any) => {
    const res = await postRequest(EPath.查询新增医院列表, param);
    return res;
  };
}

export const Service = new ImportEnergeBenchmarkLibraryService();
