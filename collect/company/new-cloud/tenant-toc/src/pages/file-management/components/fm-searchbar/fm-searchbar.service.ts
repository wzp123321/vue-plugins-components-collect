import { postRequest } from '@/service/request';
import { DictDetailQueryByCodeResponse } from './fm-searchbar.api';
enum EPath {
  查询文件类别列表 = 'tenantDict/detail/queryByCode',
}
class FmSearchbarService {
  // 查询文件类别列表
  public queryFileTypeList = async (): Promise<HttpRequestModule.ResTemplate<DictDetailQueryByCodeResponse[]>> => {
    const res = await postRequest(EPath.查询文件类别列表, 'file_category');
    return res;
  };
}

export const Service = new FmSearchbarService();
