import { request } from '@/utils/request';
import { CommonResponseType } from '@/apis/types';
import { ReturnColType } from './index.api';

/**
 * 查询表格列
 */
export const getTableColumns = (data: {
  tableCode: string;
}): CommonResponseType<ReturnColType> =>
  request({
    url: `/commonConfig/bff/web/v1/tableConfig/${data.tableCode}/getTableConfig`,
    method: 'post',
  });

/**
 * 更新表格列
 */
export const updateTableColumns = (
  data: ReturnColType,
): CommonResponseType<number> =>
  request({
    url: `/commonConfig/bff/web/v1/tableConfig/${data.tableCode}/updateTableCols`,
    method: 'post',
    data,
  });
