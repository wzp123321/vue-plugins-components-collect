import { postRequest } from '../request';
import { downloadBlobFile, getTenant, FGetQueryParam, FGetAuthorization } from '@/utils/index';
import axios from 'axios';
import serviceConfig from '@/config/service';
import message from '@/utils/message';
import { FGetCookie } from '@/core/token';
import { ECommonPath } from '../path';
import { EPath } from '../../pages/cost-detail/compotents/cd-table/constant';

const CommonService = {
  /**
   * 查询菜单栏是否有权限
   * @returns`
   */
  async checkHostingMenu(params: GeneralModule.HostingMenu) {
    const url = '/menu/checkHostingMenu';
    const res: any = await postRequest(url, params);
    return res;
  },
  /**
   * 查询菜单栏
   * @returns`
   */
  async queryMenu(params: string): Promise<GeneralModule.HttpResponseImpl<GeneralModule.MenuInfo[]>> {
    const url = `/menu/list/${params}`;
    const res: GeneralModule.HttpResponseImpl<GeneralModule.MenuInfo[]> = await postRequest(url);
    return res;
  },
  /**
   * 查询字典数据
   * @param params code
   * @returns
   */
  async queryDictionaryListByType(
    params: string,
  ): Promise<GeneralModule.HttpResponseImpl<GeneralModule.DictionaryInfo[]>> {
    const url = '/dict/detail/queryByCode';
    const res: GeneralModule.HttpResponseImpl<GeneralModule.DictionaryInfo[]> = await postRequest(url, params);
    return res;
  },
  /**
   * 经营分析-通用表头请求
   * @param params code
   * @returns
   */
  async queryBaseHead<T = GeneralModule.DictionaryInfo[]>(
    params: GeneralModule.TenantVO,
    queryUrl: string,
  ): Promise<GeneralModule.HttpResponseImpl<T>> {
    const url = queryUrl;
    const res: GeneralModule.HttpResponseImpl<T> = await postRequest(url, params);
    return res;
  },

  /**
   * 查询字典数据 （新接口）
   * @param params code
   * @returns
   */
  async queryDictionaryListByCode(
    params: string,
  ): Promise<GeneralModule.HttpResponseImpl<GeneralModule.DictionaryInfo[]>> {
    const url = '/tenantDict/detail/queryByCode';
    const res: GeneralModule.HttpResponseImpl<GeneralModule.DictionaryInfo[]> = await postRequest(url, params);
    return res;
  },

  /**
   * 查询服务器时间
   * @returns
   */
  async getServerTime(): Promise<GeneralModule.HttpResponseImpl<string>> {
    const url = '/common/system/time';
    const res = await postRequest(url);
    return res;
  },

  /**
   * 文件流导出通用接口
   * @param param 请求参数 类型自定义
   * @param reqUrl 请求地址
   * @param url type 类型 导出&下载
   * @param cbFn 成功回调
   * @param failCb 失败回调
   */
  async getFileStreamDownload<T>(
    params: T,
    reqUrl: string,
    type = '导出' || '下载',
    cbFn?: () => void,
    failCb?: () => void,
  ) {
    try {
      message.loading(`正在${type}`);
      const tenantCode = FGetQueryParam('tenantCode') ?? '';
      const res: any = await axios({
        url: `${serviceConfig.BASE_URL}${reqUrl}`,
        method: 'post',
        data: params,
        headers: {
          'content-type': 'application/json',
          tenantCode,
          token: FGetCookie('toc-token') ?? '',
          tocTenantId: FGetCookie('toc_tenant_id') ?? 540,
          username: FGetCookie('username') ?? '',
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
  },

  /***************************************************项目基础配置******************************************************************/
  /**
   * 查询托管期信息
   */
  async queryProjectHostingScope() {
    const res = await postRequest(ECommonPath.查询托管期信息, getTenant());
    return res?.data ?? [];
  },
  /**
   * 校验是否有财务专家权限
   * @returns
   */
  async checkIsFinancialExpert() {
    const res = await postRequest(EPath.是否拥有财务专家权限);
    return res?.data;
  },
  /**
   * 查询用户所属角色列表
   * @returns
   */
  async queryUserSelfRoleList() {
    const res = await postRequest(ECommonPath.查询用户角色);
    return res;
  },
};

export default CommonService;
