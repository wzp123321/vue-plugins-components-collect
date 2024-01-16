import { postRequest } from '@/service/request';

enum EPath {
  获取导入导出权限 = 'energyProjectLibrary/checkPermission',
}
class EnergyProjectLibraryService {
  /**
   * 获取导入导出权限
   */
  public checkPermission = async (): Promise<HttpRequestModule.ResTemplate<PermissionList>> => {
    const res = await postRequest(EPath.获取导入导出权限);
    return res;
  };
}

export default new EnergyProjectLibraryService();

export interface PermissionList {
  deletePermission?: number;
  downloadPermission?: number;
  editPermission?: number;
  hospitalId?: null;
  uploadPermission?: number;
  viewPermission?: number;
}

export enum CheckPermission {
  有权限 = 2,
  无权限 = 0,
}
