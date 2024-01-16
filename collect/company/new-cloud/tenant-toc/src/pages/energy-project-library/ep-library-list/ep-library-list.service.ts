import axios from 'axios';
import { postRequest } from '@/service/request';
import { FGetCookie } from '@/core/token';
import serviceConfig from '@/config/service';
import { IKeyValue, EnergyProjectLibrarySelectListPage } from './ep-library-list.api';
import message from '@/utils/message';
import { downloadBlobFile, FGetQueryParam, FGetAuthorization } from '@/utils/index';
import { useFileDownload, EFileDownloadType } from '@/core/file';
enum EPath {
  查询综能项目库列表 = 'energyProjectLibrary/selectListPage',
  查询医院名称列表 = 'energyProjectLibrary/selectListAuth',
  查询省份列表 = 'projectManagement/getProvinceList',
  查询医院等级 = 'tenantDict/detail/queryByCode',
  删除综能项目 = 'energyProjectLibrary/deleteHospital',
  下载综能项目模板 = 'energyProjectLibrary/downloadTemplate',
  导出综能项目 = 'hospitalData/downloadData',
}

class EnergeProjectLibraryListService {
  /**
   * 查询医院列表
   */
  public queryHospitalNameList = async () => {
    const res = await postRequest(EPath.查询医院名称列表);
    return res;
  };
  /**
   * 查询省份列表
   */
  public queryProvinceList = async (): Promise<HttpRequestModule.ResTemplate<IKeyValue[]>> => {
    const res = await postRequest(EPath.查询省份列表);
    return res;
  };

  /**
   * 查询医院等级
   * @param hospital_level 参数
   */
  public queryHospitalLevelList = async (): Promise<HttpRequestModule.ResTemplate<IKeyValue[]>> => {
    const res = await postRequest(EPath.查询医院等级, 'hospital_level');
    return res;
  };

  /**
   * 查询综能项目库列表
   * @param params 参数
   */
  public queryEnergeBenchmarkLibraryList = async (params: EnergyProjectLibrarySelectListPage) => {
    const res = await postRequest(EPath.查询综能项目库列表, params);
    return res;
  };

  /**
   * 删除项目
   * @param params 参数
   */
  public deleteProject = async (params: any) => {
    const res = await postRequest(EPath.删除综能项目, params);
    return res;
  };

  public download = async (reqUrl: string, type = '导出' || '下载', cbFn?: () => void, failCb?: () => void) => {
    try {
      message.loading(`正在${type}`);
      const res: any = await axios({
        url: `${serviceConfig.BASE_URL}${reqUrl}`,
        method: 'post',
        headers: {
          'content-type': 'application/json',
          token: FGetCookie('toc-token') ?? '',
          tocTenantId: FGetCookie('toc_tenant_id') ?? 540,
          username: FGetCookie('username') ?? '',
          tenantCode: FGetQueryParam('tenantCode') ?? '',
          Authorization: FGetAuthorization(),
        },
        responseType: 'blob',
      });
      console.log(res, 'res');

      if (res && res.status === 200 && res.data && res.headers['content-disposition']) {
        const fileName =
          res.headers && res.headers['content-disposition']
            ? res.headers['content-disposition'].split('filename=')[1]
            : `数据${type}`;
        downloadBlobFile(res.data, decodeURIComponent(fileName), type, () => {
          if (typeof cbFn === 'function') {
            cbFn();
          }
        });
      } else {
        if (typeof failCb === 'function') {
          failCb();
        }
        message.error(`${type}失败！`);
      }
    } catch (error) {
      if (typeof failCb === 'function') {
        failCb();
      }
      message.error(`${type}失败！`);
    }
  };

  /**
   * 导出项目库
   */
  public exportProject = async (params: any) => {
    await useFileDownload(params, EPath.导出综能项目, EFileDownloadType.导出);
  };
}

export const Service = new EnergeProjectLibraryListService();
