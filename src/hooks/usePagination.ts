import { pageSizes } from '@/config';
import { ICommonPaginationQueryParams } from '@/services/common.api';
import { reactive, ref } from 'vue';

export const usePagination = () => {
  const paginationParams = reactive<ICommonPaginationQueryParams>({
    pageNum: 1,
    pageSize: pageSizes?.[0],
    searchCount: true,
    orders: [
      {
        asc: true,
        column: '',
      },
    ],
  });
  // 总数
  const total = ref(0);
  /**
   * 设置页码
   * @param {number} value 页码
   */
  const setPageNum = (value: number) => {
    paginationParams.pageNum = value;
  };
  /**
   * 设置条数
   * @param {number} value 条数
   */
  const setPageSize = (value: number) => {
    paginationParams.pageNum = 1;
    paginationParams.pageSize = value;
  };

  return {
    paginationParams,
    total,
    pageSizes,
    setPageNum,
    setPageSize,
  };
};
