import { postRequest } from '@/service/request';
import { useFileDownload, EFileDownloadType } from '@/core/file';

import { FileManagementQueryFileListPageRequest, FileManagementQueryFileListPageResponse } from './fm-table.api';
enum EPath {
  查询文件列表 = 'fileManagement/queryFileListPage',
  删除文件 = 'fileManagement/deleteFile',
  下载文件 = 'fileManagement/downloadSingleFile',
}
class FmTableService {
  /**
   * 查询文件列表
   */
  public queryFileListPage = async (
    params: FileManagementQueryFileListPageRequest
  ): Promise<HttpRequestModule.ResTemplate<FileManagementQueryFileListPageResponse>> => {
    const res = await postRequest(EPath.查询文件列表, params);
    return res;
  };

  /**
   * 删除文件
   */

  public deleteFiles = async (params: any) => {
    const res = await postRequest(EPath.删除文件, params);
    return res;
  };

  /**
   * 单个文件下载
   */
  public downloadSingleFile = async (params: any) => {
    await useFileDownload(params, EPath.下载文件, EFileDownloadType.下载);
  };
}

export const Service = new FmTableService();
