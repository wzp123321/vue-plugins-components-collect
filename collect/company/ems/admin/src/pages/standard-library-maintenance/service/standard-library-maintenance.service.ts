import { postRequest } from '@/services/request';

/**
 * 查询列表
 * @param params
 * @returns
 */
export const getStandardLibraryList = async (params: StandardLibraryMaintenanceModule.QueryFormParams) => {
    const url = '/admin/TargetStore/queryTypeAndConfig';
    const res = await postRequest(url, params);
    return res;
};

/**
 * 更新
 * @param params
 * @returns
 */
export const getStandardLibraryUpdate = async (params: StandardLibraryMaintenanceModule.UpdateParams) => {
    const url = '/admin/TargetStore/updateConfig';
    const res = await postRequest(url, params);
    return res;
};
