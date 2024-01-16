import { postRequest } from '@/service/request';
import { HistoryVersionDateList } from './epl-e-project-toolbar.api';

import { useFileDownload, EFileDownloadType } from '@/core/file';

const enum EPath {
  查询版本时间列表 = 'energyProjectLibrary/selectVersionPage',
  导出或下载版本 = 'hospitalData/downloadData',
  删除历史版本 = 'energyProjectLibrary/deleteVersion',
  删除综能项目 = 'energyProjectLibrary/deleteHospital',
}
class EplEProjectToolbarService {
  /**
   * 查询版本时间列表
   */
  public queryHistoryVersionDateList = async (params: any): Promise<any> => {
    const res = await postRequest(EPath.查询版本时间列表, params);
    return res;
  };

  public downloadData = async (params: any) => {
    await useFileDownload(params, EPath.导出或下载版本, EFileDownloadType.导出);
  };

  public singleDel = async (params: any) => {
    const res = await postRequest(EPath.删除历史版本, params);
    return res;
  };

  public deleteHospital = async (params: any) => {
    const res = await postRequest(EPath.删除综能项目, params);
    return res;
  };
}

export const Service = new EplEProjectToolbarService();
