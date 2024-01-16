import { postRequest } from '@/services/request';
import { downloadBlobFile, FGetSessionStorageData } from '../../utils/index';
import axios from 'axios';
import serviceConfig from '@/config/request';
import { FGetAuthorization } from '@/utils/crypto';
import message from '@/utils/message';
// import GatewayUtil from '@/utils/access-token/GatewayUtil';
// import { APP_ID } from '@/utils/access-token/api';

const CommonService = {
  /**
   * 请求头部筛选树
   * @param params
   * @returns
   */
  async getEmsTreeInfo(params: { treeType: number }) {
    const url = '/admin/tree/list';
    const res = await postRequest(url, params);
    return res;
  },
  /**
   * 请求头部筛选树带展开节点数组
   * @param params
   * @returns
   */
  async getEmsTreeInfoWithExpandKeys(params: {
    energyCode?: string;
    treeType: number;
    expandLevel: number;
  }) {
    const url = '/admin/tree/listTreeByEnergyCode';
    const res = await postRequest(url, params);
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
    failCb?: () => void
  ) {
    try {
      message.loading(`正在${type}`);

      const res: any = await axios({
        url: `${serviceConfig.BASE_URL}${reqUrl}`,
        method: 'post',
        data: params,
        headers: {
          'content-type': 'application/json',
          tenantCode: FGetSessionStorageData('energy-corpid') as string,
          token: FGetSessionStorageData('energy-token') as string,
          loginName: FGetSessionStorageData('energy-loginName') as string,
          Authorization: FGetAuthorization(),
          // access_token: GatewayUtil.buildClientAccessToken() || '',
          // app_id: APP_ID,
        },
        responseType: 'blob',
      });
      if (
        res &&
        res.status === 200 &&
        res.data &&
        res.headers['content-disposition']
      ) {
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

  /**
   * 获取字典数据
   * @param params dictCode
   * @returns
   */
  async getDictionaryData(
    params: string
  ): Promise<HttpRequestModule.ResTemplate<GlobalModule.DictionaryInfo[]>> {
    const url = '/dict/query';
    const res: HttpRequestModule.ResTemplate<GlobalModule.DictionaryInfo[]> =
      await postRequest(url, params);
    return res;
  },
};
export default CommonService;
