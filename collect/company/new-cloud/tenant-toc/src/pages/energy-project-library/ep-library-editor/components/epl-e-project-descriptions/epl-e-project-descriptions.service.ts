import { postRequest } from '@/service/request';
import { ProjectDescriptionsData } from './epl-e-project-descriptions.api';

enum EPath {
  查询项目描述列表 = 'energyProjectLibrary/selectListPage',
}
class EplEProjectDescriptionsService {
  /**
   * @description 项目描述列表
   * @param {object} id
   */
  public queryProjectDescriptions = async (
    id:any
  ): Promise<any> => {
    const res = await postRequest(EPath.查询项目描述列表, id);
    return res;
  };
}

export const Service = new EplEProjectDescriptionsService();
