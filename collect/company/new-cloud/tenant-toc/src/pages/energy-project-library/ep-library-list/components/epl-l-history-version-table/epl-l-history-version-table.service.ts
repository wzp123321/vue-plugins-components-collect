import { postRequest } from '@/service/request';
import { EnergyProjectLibrarySelectVersionPage } from './epl-l-history-version-table.api';
import { useFileDownload, EFileDownloadType } from '@/core/file';

enum EPath {
  查询历史版本数据列表 = 'energyProjectLibrary/selectVersionPage',
  删除历史版本 = 'energyProjectLibrary/deleteVersion',
  下载历史版本 = 'hospitalData/downloadData',
}
class HistoryVersionLibraryService {
  /**
   * 查询历史版本数据列表
   * @param {params} 参数
   */
  public queryEnergeBenchmarkLibraryList = async (params: EnergyProjectLibrarySelectVersionPage) => {
    const res = await postRequest(EPath.查询历史版本数据列表, params);
    return res;
  };

  /**
   * 单个文件下载
   * @param {params} 文件ID
   */
  public singleDownload = async (params: any) => {
    await useFileDownload(params, EPath.下载历史版本, EFileDownloadType.下载);
  };

  /**
   * 单个文件删除
   * @param {params} 文件ID
   */
  public singleDel = async (params: any) => {
    const res = await postRequest(EPath.删除历史版本, params);
    return res;
  };
}

export const Service = new HistoryVersionLibraryService();
