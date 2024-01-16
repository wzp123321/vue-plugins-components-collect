import { ElMessageBox } from 'element-plus';
import { postRequest } from '../request';
import { downloadBlobFile } from '@/utils/index';
import { FGetSessionStorageData, FGetAuthorization, handleLogOut } from '@/utils/token';
import axios from 'axios';
import serviceConfig from '@/config/request';
// components
import message from '@/utils/message';
// import GatewayUtil from '@/utils/access-token/gatewayUtil';
// import { APP_ID } from '@/utils/access-token/api';

import { CheckTokenRes, KeepAliveParams, Common_ICodeName, LogOutParams } from './common-api';

const CommonService = {
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
   * 请求树--不带空间信息
   * @param params
   * @returns
   */
  async getEmsTreeListWidthoutLocation(params: { keyword?: string; treeType: number }) {
    const url = '/admin/tree/energySave/list';
    const res = await postRequest(url, params);
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
        tenantCode: (FGetSessionStorageData('energy-corpid') as string) ?? '',
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
    const ins = message.loading(`正在${type}`);
    try {
      // const accessToken = GatewayUtil.buildClientAccessToken();
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
          // access_token: accessToken as string,
          // app_id: APP_ID,
        },
        responseType: 'blob',
      });
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
        console.log(res);
        ins?.close();
        const reader = new FileReader();
        if (res?.data?.size && res?.data?.type.includes('json')) {
          reader.onloadend = (e) => {
            const res = JSON.parse(e.target?.result as string);
            if (Number(res?.errcode) === 401 || res?.code === 401) {
              ElMessageBox.alert('登录信息已失效，请重新登录', '', {
                confirmButtonText: '确认',
                showClose: false,
                showCancelButton: false,
                type: 'warning',
              })
                .then(() => {
                  window.location.href = res.errmsg || res.message;
                })
                .catch(() => {
                  console.warn('cancel');
                });
            }
          };
          reader.readAsText(res?.data);
        } else {
          message.error(`${type}失败！`);
        }
      }
    } catch (error) {
      if (typeof failCb === 'function') {
        failCb();
      }
      ins?.close();
      const reader = new FileReader();
      if ((error as any)?.response?.data?.errcode === '4f000002' || JSON.stringify(error)?.includes('401')) {
        ElMessageBox.alert('登录信息已失效，请重新登录', '', {
          confirmButtonText: '确认',
          showClose: false,
          showCancelButton: false,
          type: 'warning',
        })
          .then(() => {
            handleLogOut();
          })
          .catch(() => {
            console.warn('cancel');
          });
      } else if ((error as any)?.response?.data?.size && (error as any)?.response?.data?.type.includes('json')) {
        reader.onloadend = (e) => {
          const res = JSON.parse(e.target?.result as string);
          if (Number(res?.errcode) === 401 || res?.code === 401) {
            ElMessageBox.alert('登录信息已失效，请重新登录', '', {
              confirmButtonText: '确认',
              showClose: false,
              showCancelButton: false,
              type: 'warning',
            })
              .then(() => {
                window.location.href = res.errmsg || res.message;
              })
              .catch(() => {
                console.warn('cancel');
              });
          } else {
            message.error(`${type}失败${res?.errmsg ? '，' + res?.errmsg : ''}`);
          }
        };
        reader.readAsText((error as any)?.response?.data);
      } else {
        message.error(`${type}失败！`);
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
   * 获取节点类型
   * @param params dictCode
   * @returns
   */
  async getEmsDictionaryData(params: string): Promise<HttpRequestModule.ResTemplate<GlobalModule.DictionaryInfo[]>> {
    const url = '/emsDict/query';
    const res: HttpRequestModule.ResTemplate<GlobalModule.DictionaryInfo[]> = await postRequest(url, params);
    return res;
  },
  /**
   * 获取空间中心下拉框数据
   * @returns
   */
  async geLocationListByType(params: { nodeType: string; treeType: string }) {
    const url = '/admin/tree/queryLocation';
    const res: any = await postRequest(url, params);
    return res;
  },
  /**
   * 查询菜单
   * @param systemFlag
   * @returns
   */
  async getMenuListByProjectType(params: number): Promise<HttpRequestModule.ResTemplate<GlobalModule.MenuRes>> {
    const url = `/menu/queryMenu/${params}`;
    const res: HttpRequestModule.ResTemplate<GlobalModule.MenuRes> = await postRequest(url, params);
    return res;
  },
  /**
   * 获取没有parent的分类分项
   */
  async getEnergyCodeListWithOutParent() {
    const url = '/abnormal/queryEnergyCodeWithoutParent';
    const res = await postRequest(url);
    return res;
  },
  /**
   * 获取分类分项列表
   * @param params
   * @returns
   */
  async getEnergyCodeList(
    params: EnergyCodeManageModule.EnergyQueryParams,
  ): Promise<HttpRequestModule.ResTemplate<HttpRequestModule.HttpListResponsive<EnergyCodeManageModule.EnergyInfo[]>>> {
    const reqUrl = '/admin/energy/code/query';
    const res: HttpRequestModule.ResTemplate<
      HttpRequestModule.HttpListResponsive<EnergyCodeManageModule.EnergyInfo[]>
    > = await postRequest(reqUrl, params);
    return res;
  },
  /*
   * 分层分类详情
   * @param params
   * @returns
   */
  async getAllEnergyCodeTree(): Promise<HttpRequestModule.ResTemplate<EnergyCodeManageModule.EnergyInfo[]>> {
    const reqUrl = '/admin/energy/code/queryEnergyAsTree';
    const res: HttpRequestModule.ResTemplate<EnergyCodeManageModule.EnergyInfo[]> = await postRequest(reqUrl);
    return res;
  },
  /**
   * 查询全部分类分项
   * @returns
   */
  async getAllEnergyCodeList(): Promise<HttpRequestModule.ResTemplate<Array<{ code: string; name: string }>>> {
    const reqUrl = '/admin/energy/code/list';
    const res: HttpRequestModule.ResTemplate<
      Array<{
        code: string;
        name: string;
      }>
    > = await postRequest(reqUrl);
    return res;
  },
  /**
   * 查询计入能耗分类分项顶级节点
   * @returns
   */
  async getEnergyTopLevelList(): Promise<HttpRequestModule.ResTemplate<Array<{ code: string; name: string }>>> {
    const reqUrl = '/admin/energy/code/listEnergyParentCode';
    const res: HttpRequestModule.ResTemplate<
      Array<{
        code: string;
        name: string;
      }>
    > = await postRequest(reqUrl);
    return res;
  },
  /**
   * @returns
   */
  async getEnergyParentCodeExcludeTotal(): Promise<
    HttpRequestModule.ResTemplate<Array<{ code: string; name: string }>>
  > {
    const reqUrl = '/admin/energy/code/listEnergyParentCodeExcludeTotal';
    const res: HttpRequestModule.ResTemplate<
      Array<{
        code: string;
        name: string;
      }>
    > = await postRequest(reqUrl);
    return res;
  },
  /**
   * @returns
   */
  async getEnergyCodeTree(): Promise<HttpRequestModule.ResTemplate<Array<{ code: string; name: string }>>> {
    const reqUrl = '/admin/energy/code/tree';
    const res: HttpRequestModule.ResTemplate<
      Array<{
        code: string;
        name: string;
      }>
    > = await postRequest(reqUrl);
    return res;
  },
  /**
   * token鉴权，获取用户信息
   * @param token
   * @returns
   */
  async getTenantInfoByToken(token: string | {}): Promise<HttpRequestModule.ResTemplate<CheckTokenRes>> {
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
   * 根据code查询字典
   * @param dictCode 字典code
   * @returns
   */
  async queryDictionByCode(dictCode: string): Promise<HttpRequestModule.ResTemplate<Common_ICodeName[]>> {
    const url = '/emsDict/query';
    const res: HttpRequestModule.ResTemplate<Common_ICodeName[]> = await postRequest(url, dictCode);
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
};

export default CommonService;
