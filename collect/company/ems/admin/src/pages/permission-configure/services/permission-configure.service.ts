import { FGetQueryParam } from '@/utils/index';
import axios from 'axios';
import { FGetAuthorization } from '@/utils/token';

import { HttpResponseImpl } from '../../../services/common/common-api';
import { PermissionConfigureVO, PermissionUpdateParams } from './permission-configure-api';

import ServiceConfig from '../../../config/request';

const permissionConfigureService = {
  /**
   * 查询树节点绑定情况
   * @returns
   */
  async getPermissionConfigureDetail(roleCode: string): Promise<HttpResponseImpl<PermissionConfigureVO>> {
    const res = await axios({
      url: `${ServiceConfig.BASE_URL}/rolePermissionTree/query`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        tenantCode: (FGetQueryParam('tenantId') as string) ?? '',
        Authorization: FGetAuthorization(),
      },
      data: roleCode,
    });
    return {
      code: Number(res.data?.errcode) || res.data?.code,
      message: res.data?.errmsg || res.data?.message,
      data: res.data?.data,
      success: res.data?.success,
    };
  },
  /**
   * 编辑绑定
   * @param params
   * @returns
   */
  async getPermissionConfigureUpdate(params: PermissionUpdateParams): Promise<HttpResponseImpl<number>> {
    const res = await axios({
      url: `${ServiceConfig.BASE_URL}/rolePermissionTree/update`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        tenantCode: (FGetQueryParam('tenantId') as string) ?? '',
        Authorization: FGetAuthorization(),
      },
      data: params,
    });

    return {
      code: Number(res.data?.errcode) || res.data?.code,
      message: res.data?.errmsg || res.data?.message,
      data: res.data?.data,
      success: res.data?.success,
    };
  },
};

export default permissionConfigureService;
