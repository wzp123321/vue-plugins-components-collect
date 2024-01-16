import { postRequest } from '@/services/request';
import {
  ResTemplate,
  MenuRes,
  CheckTokenRes,
  KeepAliveParams,
  LogOutParams,
  CheckMenuParams,
  CheckMenuRes,
  UpdateSelectedCampusParams,
  IQueryAlarmParams,
  IHeaderAlarmVO,
} from './common.type';
import { FGetSessionStorageData } from '@/utils';

const commonService = {
  /**
   * 查询菜单
   * @param params
   * @returns
   */
  async getMenuListByProjectType(params: number): Promise<ResTemplate<MenuRes>> {
    const url = `/menu/queryMenu/${params}`;
    const res: ResTemplate<MenuRes> = await postRequest(url, params);
    return res;
  },

  /**
   * token鉴权，获取用户信息
   * @param token
   * @returns
   */
  async getTenantInfoByToken(token: string | {}): Promise<ResTemplate<CheckTokenRes>> {
    const url = '/getHeadInfo';
    const res: ResTemplate<CheckTokenRes> = await postRequest(url, token);
    return res;
  },

  /**
   * token鉴权
   * @param params
   * @returns
   */
  async getTokenCheck(params: KeepAliveParams): Promise<ResTemplate<string>> {
    const url = '/keepAlive';
    const res: ResTemplate<string> = await postRequest(url, params);
    return res;
  },

  /**
   * 登出
   * @returns
   */
  async logOut(params: LogOutParams): Promise<ResTemplate<string>> {
    const url = '/logOut';
    const res: ResTemplate<string> = await postRequest(url, params);
    return res;
  },

  /**
   * 菜单鉴权
   * @param params
   * @returns
   */
  async getMenuUrlCheck(params: CheckMenuParams): Promise<ResTemplate<CheckMenuRes>> {
    const url = '/menu/checkMenu';
    const res: ResTemplate<CheckMenuRes> = await postRequest(url, params);
    return res;
  },

  /**
   * 更新选中院区
   * @returns
   */
  async getSelectedCampusCodesUpdate(params: UpdateSelectedCampusParams): Promise<ResTemplate<number>> {
    const url = '/authService';
    const res: ResTemplate<number> = await postRequest(url, params);
    return res;
  },

  /**
   * 更新选中院区
   * @returns
   */
  async queryAlarmInfo(params: IQueryAlarmParams): Promise<ResTemplate<IHeaderAlarmVO>> {
    const url = '/getAlarmInfo';
    const res: ResTemplate<IHeaderAlarmVO> = await postRequest(url, params);
    return res;
  },
  /**
   * 获取服务器时间
   * @returns
   */
  async getServerTime(): Promise<ResTemplate<string>> {
    const url = '/common/system/time';
    const res = await postRequest(url, {
      tenantCode: FGetSessionStorageData('energy-corpid') ?? '',
    });
    return res;
  },
};

export default commonService;
