import { postRequest } from '@/service/request';
import { useFileUpload } from '@/core/file';

enum EPath {
  上传文件 = 'fileManagement/uploadExcel',
  查询时间维度 = 'fileManagement/timeDimensionList',
}
class FmUploadService {
  /**
   * 文件上传
   */
  public uploadFile = async (params: any): Promise<any> => {
    const res = await useFileUpload(params, EPath.上传文件);
    return res;
  };

  /**
   * 查询时间维度
   */
  public queryTimeDimensionList = async (params: any) => {
    const res = await postRequest(EPath.查询时间维度, params);
    return res;
  };
}

export const Service = new FmUploadService();
