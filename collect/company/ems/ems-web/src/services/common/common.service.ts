import { postRequest } from '@/services/request';
import { downloadBlobFile } from '@/utils/index';
import axios from 'axios';
import store from '@/store/index';
import serviceConfig from '@/config/request';
import message from '@/utils/message';
import { getCampusParams, FGetAuthorization, FGetStorageData } from '@/utils/token';

import {
  CheckTokenRes,
  KeepAliveParams,
  LogOutParams,
  UpdateSelectedCampusParams,
  CheckMenuParams,
  CheckMenuRes,
  Common_IEnergyVO,
  Common_EPath,
  Common_ICodeName,
} from './common-api';

// import GatewayUtil from '@/utils/access-token/GatewayUtil';
// import { APP_ID } from '@/utils/access-token/api';

const commonService = {
  /**
   * 请求头部筛选树
   * @param params
   * @returns
   */
  async getEmsTreeInfo(params: { keyword?: string; treeType: number }) {
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
    leLevel?: number;
    wholeHospitalFlag?: boolean;
  }) {
    let p = {
      ...params,
      ...getCampusParams(),
    };
    if (params?.wholeHospitalFlag) {
      p = {
        ...p,
        wholeHospitalFlag: params?.wholeHospitalFlag,
      };
    }
    const url = '/admin/tree/listTreeByEnergyCode';
    const res = await postRequest(url, p);
    return res;
  },
  /**
   * 查询科室的分析对象
   * @param params
   * @returns
   */
  async getOfficeAnalysisTreeData(params: {
    energyCode?: string;
    treeType: number;
    expandLevel: number;
    leLevel?: number;
    wholeHospitalFlag?: boolean;
  }) {
    let p = {
      ...params,
      ...getCampusParams(),
    };
    if (params?.wholeHospitalFlag) {
      p = {
        ...p,
        wholeHospitalFlag: params?.wholeHospitalFlag,
      };
    }
    const url = '/admin/apportionTree/queryApportionTree';
    const res = await postRequest(url, p);
    return res;
  },
  /**
   * 查询包括总能耗且标记为能耗的能源类型树结构
   * @returns
   */
  async queryEnergyFlagOneExcludeTotalTree() {
    const url = '/admin/energy/code/queryEnergyFlagOneIncludeTotalAsTree';
    const res = await postRequest(url);
    return res;
  },
  /**
   * 获取系统时间
   * @returns
   */
  async getServerDate() {
    let serverDate: Date;
    try {
      const url = '/common/system/time';
      const res = await postRequest(url, {
        tenantCode: FGetStorageData('energy-corpid') ?? '',
      });
      if (res && res.data) {
        serverDate = new Date(res.data);
      } else {
        serverDate = new Date();
      }
    } catch (error) {
      throw Promise.reject(error);
    }
    return serverDate;
  },
  /**
   * 文件流导出通用接口
   * @param param 请求参数 类型自定义
   * @param reqUrl 请求地址
   * @param type type 类型 导出&下载
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
    const messageInst = message.loading(`正在${type}`);
    try {
      const tenantCode = store?.getters?.tenantCode ?? '';
      const loginName = store?.getters?.loginName ?? '';
      const token = store?.getters?.token ?? '';
      const Authorization = FGetAuthorization();
      // const access_token = GatewayUtil.buildClientAccessToken() || '';
      // const app_id = APP_ID;
      const res: any = await axios({
        url: `${serviceConfig.BASE_URL}${reqUrl}`,
        method: 'post',
        data: params,
        headers: {
          'content-type': 'application/json',
          tenantCode,
          loginName,
          token,
          Authorization,
          // access_token,
          // app_id,
        },
        responseType: 'blob',
      });
      if (
        res &&
        res.status === 200 &&
        res.data &&
        res.headers['content-disposition'] &&
        res?.data?.type !== 'application/json'
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
        messageInst?.close();
        const reader = new FileReader();
        if (res?.data?.size && res?.data?.type.includes('json')) {
          reader.onloadend = (e) => {
            const res = JSON.parse(e.target?.result as string);
            if (Number(res?.errcode) === 401 || res?.code === 401) {
              window.parent.postMessage(
                {
                  code: Number(res?.errcode) || res.code,
                  message: res.errmsg || res.message,
                  type: 'ems-login-failure',
                },
                window.location.origin,
              );
            } else {
              message.error(res?.errmsg ? res?.errmsg : `${type}失败`);
            }
          };
          reader.readAsText(res?.data);
        } else {
          message.error(`${type}失败`);
        }
      }
    } catch (error) {
      if (typeof failCb === 'function') {
        failCb();
      }
      messageInst?.close();
      const reader = new FileReader();
      if ((error as any)?.response?.data?.errcode === '4f000002' || JSON.stringify(error)?.includes('401')) {
        window.parent.postMessage(
          {
            code: '4f000002',
            message: '',
            type: 'ems-login-failure',
          },
          window.location.origin,
        );
      } else if ((error as any)?.response?.data?.size && (error as any)?.response?.data?.type.includes('json')) {
        reader.onloadend = (e) => {
          const res = JSON.parse(e.target?.result as string);
          if (Number(res?.errcode) === 401 || res?.code === 401) {
            window.parent.postMessage(
              {
                code: '4f000002',
                message: '',
                type: 'ems-login-failure',
              },
              window.location.origin,
            );
          } else {
            message.error(`${type}失败${res?.errmsg ? '，' + res?.errmsg : ''}`);
          }
        };
        reader.readAsText((error as any)?.response?.data);
      } else {
        message.error(`${type}失败`);
      }
    }
  },
  /**
   * 获取字典数据
   * @param params dictCode
   * @returns
   */
  async getDictionaryData(params: string): Promise<HttpRequestModule.ResTemplate<GlobalModule.DictionaryInfo[]>> {
    const url = '/dict/query';
    const res: HttpRequestModule.ResTemplate<GlobalModule.DictionaryInfo[]> = await postRequest(url, params);
    return res;
  },
  /**
   * 查询菜单
   * @param params
   * @returns
   */
  async getMenuListByProjectType(params: number): Promise<HttpRequestModule.ResTemplate<GlobalModule.MenuRes>> {
    const url = `/menu/queryMenu/${params}`;
    const res: HttpRequestModule.ResTemplate<GlobalModule.MenuRes> = await postRequest(url, params);
    return res;
  },
  /**
   * token鉴权，获取用户信息
   * @param token
   * @returns
   */
  async getTenantInfoByToken(token: string): Promise<HttpRequestModule.ResTemplate<CheckTokenRes>> {
    const url = '/getHeadInfo';
    const res: HttpRequestModule.ResTemplate<CheckTokenRes> = await postRequest(url, token);
    return res;
  },
  /**
   * token鉴权
   * @param params
   * @returns
   */
  async getTokenCheck(params: KeepAliveParams): Promise<HttpRequestModule.ResTemplate<string>> {
    const url = '/keepAlive';
    const res: HttpRequestModule.ResTemplate<string> = await postRequest(url, params);
    return res;
  },
  /**
   * 登出
   * @returns
   */
  async logOut(params: LogOutParams): Promise<HttpRequestModule.ResTemplate<string>> {
    const url = '/logOut';
    const res: HttpRequestModule.ResTemplate<string> = await postRequest(url, params);
    return res;
  },
  /**
   * 更新选中院区
   * @returns
   */
  async getSelectedCampusCodesUpdate(
    params: UpdateSelectedCampusParams,
  ): Promise<HttpRequestModule.ResTemplate<number>> {
    const url = '/authService';
    const res: HttpRequestModule.ResTemplate<number> = await postRequest(url, params);
    return res;
  },
  /**
   * 菜单鉴权
   * @param params
   * @returns
   */
  async getMenuUrlCheck(params: CheckMenuParams): Promise<HttpRequestModule.ResTemplate<CheckMenuRes>> {
    const url = '/menu/checkMenu';
    const res: HttpRequestModule.ResTemplate<CheckMenuRes> = await postRequest(url, params);
    return res;
  },
  /**
   * 查询不带总能耗的一级能源类型
   * @returns
   */
  async getEnergyTypeWithoutTotalEnergy(): Promise<HttpRequestModule.ResTemplate<Common_IEnergyVO[]>> {
    const res: HttpRequestModule.ResTemplate<Common_IEnergyVO[]> = await postRequest(
      Common_EPath.查询能源类型不带总能耗,
    );
    return res;
  },
  /**
   * 根据后台配置的树模型查询对应展示的类型列表
   * @returns
   */
  async queryTreeTypeListByAdminTreeConfigure() {
    const res: HttpRequestModule.ResTemplate<Common_ICodeName[]> = await postRequest(
      Common_EPath.根据后台树模型配置情况查询树类型,
    );
    return res;
  },
};

export default commonService;
