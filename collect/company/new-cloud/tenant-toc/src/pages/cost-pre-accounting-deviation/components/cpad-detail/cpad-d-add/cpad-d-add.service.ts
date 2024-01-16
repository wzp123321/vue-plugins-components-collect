import { postRequest } from '@/service/request';

enum EPath {
  新增批语 = 'costAccounting/comment/edit',
}
class CpadDAddService {
  public addComment = async (params: any) => {
    const res = await postRequest(EPath.新增批语, params);
    return res;
  };
}

export default new CpadDAddService();
