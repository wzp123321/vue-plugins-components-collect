import RestResult from '../../models/RestResult';
import PageResult from '../../models/PageResult';

const PAGE_SIZE = 100;

// RestResult<PageResult<unknown>>格式的分页接口返回全部数据
const getAllResultForPage = async (
  apiFunc: Function,
  tenantId: string = '',
  filterParams: object = {},
  pageIsObject: boolean = true,
  length: number = 0
): Promise<unknown[]> => {
  let pageNum = 1;
  let total = 0;
  let result: unknown[] = [];

  const pageParams = pageIsObject ? { page: { pageNum, pageSize: PAGE_SIZE } } : { pageNum, pageSize: PAGE_SIZE };
  const res: RestResult<PageResult<unknown>> = await (tenantId
    ? apiFunc(tenantId, { ...(filterParams || {}), ...pageParams })
    : apiFunc({ ...(filterParams || {}), ...pageParams }));
  if (res?.errcode === '0') {
    total = res.data?.total || 0;
    result = [...(res.data?.records || [])];
  }

  if (pageNum * PAGE_SIZE < (length || total)) {
    // 请求的promise数组
    const promiseArr = new Array(Math.ceil((length || total) / PAGE_SIZE) - 1).fill(0).map((_, index) => {
      const pageNum = index + 2; // 页码从2开始
      const pageParams = pageIsObject ? { page: { pageNum, pageSize: PAGE_SIZE } } : { pageNum, pageSize: PAGE_SIZE };
      return tenantId
        ? apiFunc(tenantId, { ...(filterParams || {}), ...pageParams })
        : apiFunc({ ...(filterParams || {}), ...pageParams });
    });
    const resArr = await Promise.all(promiseArr);
    resArr.forEach((item) => {
      result = [...result, ...(item.data?.records || [])];
    });
  }

  return new Promise((resolve) => {
    resolve(result);
  });
};

export default getAllResultForPage;
