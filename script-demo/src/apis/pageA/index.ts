import { request } from '@/utils/request';
import {
  QueryParams,
  DetailDTO,
  FormData,
  ContactsRow,
  RowData,
  BedInfo,
  HealthInfo,
  ContactListParams,
} from './index.api';
import { CommonResponseType, CommonReturn, TreeNode } from '../types';

/**
 * 获取列表
 */
export const getList = (
  data: QueryParams,
): CommonResponseType<CommonReturn<RowData>> =>
  request({
    url: `/sec/seniorProfile/page`,
    method: 'post',
    data,
  });

/**
 * 查询详情
 */
export const getDetail = (id: string | number): CommonResponseType<DetailDTO> =>
  request({
    url: `/sec/seniorProfile/detail`,
    method: 'post',
    data: {
      id,
    },
  });

/**
 * 导出
 */
export const exportData = (data: QueryParams): CommonResponseType<any> =>
  request({
    url: `/sec/seniorProfile/export`,
    method: 'post',
    data,
  });
// 导入
export const importData = (data: FormData): CommonResponseType<any> =>
  request({
    url: `/sec/seniorProfile/import`,
    method: 'post',
    data,
  });

// 新增数据
export const createData = (data: Partial<FormData>): CommonResponseType<any> =>
  request({
    url: `/sec/seniorProfile/create`,
    method: 'post',
    data,
  });
// 编辑
export const editData = (data: Partial<FormData>): CommonResponseType<any> =>
  request({
    url: `/sec/seniorProfile/update`,
    method: 'post',
    data,
  });
// 删除
export const deleteData = (id: string | number): CommonResponseType<any> =>
  request({
    url: `/sec/seniorProfile/delete`,
    method: 'post',
    data: {
      id,
    },
  });
// 获取联系人列表
export const getContactList = (
  data: ContactListParams,
): CommonResponseType<ContactsRow> =>
  request({
    url: `/sec/seniorRelatives/page`,
    method: 'post',
    data,
  });
// 新建联系人
export const createContact = (data: ContactsRow): CommonResponseType<any> =>
  request({
    url: `/sec/seniorRelatives/create`,
    method: 'post',
    data,
  });
// 新建联系人
export const editContact = (data: ContactsRow): CommonResponseType<any> =>
  request({
    url: `/sec/seniorRelatives/update`,
    method: 'post',
    data,
  });
// 新建联系人
export const deleteContact = (id: string): CommonResponseType<any> =>
  request({
    url: `/sec/seniorRelatives/delete`,
    method: 'post',
    data: { id },
  });
// 提交床位变更
export const submitBedSpaceChange = (data: {
  seniorId: string;
  bedId: string;
  updateBedId: string;
}): CommonResponseType<any> =>
  request({
    url: `/sec/seniorProfile/updateBed`,
    method: 'post',
    data,
  });

// 获取床位
export const getBedFreeTree = (): CommonResponseType<
  Array<TreeNode<BedInfo>>
> =>
  request({
    url: `/sec/bed/tree/free`,
    method: 'post',
  });

// 获取详情
export const getContactDetail = (id: string): CommonResponseType<ContactsRow> =>
  request({
    url: `/sec/seniorRelatives/detail`,
    method: 'post',
    data: { id },
  });

// 老人选择接口  /sec/seniorProfile/select
export const getSeniorProfileSelect = (
  searchValue?: string | null,
  customParams?: Record<string, any>,
  pageSize: number = 200,
  pageNum: number = 1,
) =>
  request({
    url: `/sec/seniorProfile/select`,
    method: 'post',
    data: {
      searchValue,
      pageSize,
      pageNum,
      ...customParams,
    },
  });
// 查询健康信息
export const getHealthInfo = (
  seniorId: string,
): CommonResponseType<HealthInfo> =>
  request({
    url: `/sec/seniorProfile/getHealthInfo`,
    method: 'post',
    data: {
      seniorId,
    },
  });

// 更新养老信息
export const updateHealthInfo = (
  data?: Partial<HealthInfo>,
): CommonResponseType<HealthInfo> =>
  request({
    url: `/sec/seniorProfile/updateHealthInfo`,
    method: 'post',
    data,
  });
