/*
 * @Author: yanghui yanghui@tiansu-china.com
 * @Date: 2024-02-23 10:46:53
 * @LastEditors: guorj guorj@tiansu-china.com
 * @LastEditTime: 2025-07-01 09:55:44
 * @Description:
 */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-namespace */
import { Table } from './interface/index';
import { reactive, computed, toRefs, provide, ref, nextTick, toRef } from 'vue';
import { debounce } from '../utils';
/**
 * @description table 页面操作方法封装
 * @param {Function} api 获取表格数据 api 方法 (必传)
 * @param {Object} initParam 获取数据初始化参数 (非必传，默认为{})，！！！！！！！重置操作默认清空
 * @param {Boolean} isPageable 是否有分页 (非必传，默认为true)！！！！分页参数
 * @param {Function} dataCallBack 对后台返回的数据进行处理的方法 (非必传)
 */
export const useTable = <T>(
  pageSize: number = 0,
  api?: (params: any) => Promise<any>,
  initParam: Record<string, unknown> = {},
  isPageable: boolean = true,
  dataCallBack?: (data: any) => any,
  requestError?: (error: any) => void,
  initColumnParam: Record<string, unknown> = {},
  pageSaveApi?: (params: any) => void,
  requestAuto: boolean = true,
  pageSizes?: Array<number>,
  isPageParam: boolean = false,
) => {
  const state = reactive<Table.StateProps<T>>({
    // 表格数据
    tableData: [],
    // 分页数据
    pageInfo: {
      // 当前页数
      pageNum: 1,
      // 每页显示条数
      pageSize: pageSize,
      // 总条数
      total: 0,
      pageSizes,
    },
    // 表格内部参数，如表格排序，表格筛选
    tableParam: {},
    // 总参数(包含分页和查询参数)
    totalParam: {},
    loading: requestAuto ? true : false,
  });

  const filterProp = ref<any>({});
  // 收齐折叠按钮右侧间距
  const resizebarRight = ref(`0`);

  //与业务绑定，接收筛选弹窗的参数并查询参数
  const sendFilterData = (res?: any) => {
    state.tableParam[res.key] = res.value;
    // filterProp用来暴露给组件外部
    filterProp.value[res.key] = res.value;
    Object.keys(filterProp.value).forEach((item: any) => {
      if (filterProp.value[item]?.length == 0) {
        delete filterProp.value[item];
      }
    });
    state.pageInfo.pageNum = 1;
    getTableList();
  };
  provide('sendFilterData', sendFilterData);

  // 设置初始的每页展示条数
  const setPageSize = (pageSize: number) => {
    if (isPageParam) {
      pageParam.value.page.pageSize = pageSize;
    } else {
      pageParam.value.pageSize = pageSize;
    }
  };

  /**
   * @description 分页查询参数(只包括分页和表格字段排序,其他排序方式可自行配置)
   */
  const pageParam = computed({
    get: () => {
      if (isPageParam) {
        return {
          page: {
            pageNum: state.pageInfo.pageNum,
            pageSize: state.pageInfo.pageSize,
          },
        };
      }
      return {
        pageNum: state.pageInfo.pageNum,
        pageSize: state.pageInfo.pageSize,
      };
    },
    set: (newVal: any) => {
      // console.log('我是分页更新之后的值', newVal)
    },
  });

  /**
   * @description 获取表格数据
   * @return void
   */
  const getTableList = debounce(async () => {
    state.loading = true;
    state.tableData = []; // 每次调用前清空 tableData
    if (!api) {
      state.loading = false;
      return;
    }
    try {
      // 先把初始化参数和分页参数放到总参数里面
      Object.assign(
        state.totalParam,
        initParam,
        isPageable ? pageParam.value : {},
      );
      let res = await api({ ...state.tableParam, ...state.totalParam });
      if (res.data.rows && res.data.total.toString()) {
        let { data } = res;
        dataCallBack && (data = dataCallBack(res.data));
        state.tableData = isPageable ? data.rows : data.rows;
        state.pageInfo.total = data.total;
        setRowIndex(state.tableData);
        state.loading = false;
      } else {
        let rows: any = [];
        let total: number = 0;
        dataCallBack && ({ rows, total } = dataCallBack(res));
        state.tableData = isPageable ? rows : rows;
        state.pageInfo.total = total;
        setRowIndex(state.tableData);
        state.loading = false;
      }
    } catch (error) {
      state.loading = false;
      requestError && requestError(error);
    }
  }, 400);

  /**
   * @description 手动给数据添加index,(在树结构数据下index赋值有问题),树结构数据不展示index
   */
  const setRowIndex = (data: any[]) => {
    data.forEach((item, index) => {
      item.isIndex = true;
      item.parentIndex =
        index + 1 + (state.pageInfo.pageNum - 1) * state.pageInfo.pageSize;
    });
  };

  /**
   * @description 重置将参数清空
   * @return void
   */
  const resetTotalParam = () => {
    Object.keys(initParam).forEach((key) => {
      initParam[key] = null;
    });
  };

  /**
   * @description 表格数据查询
   * @return void
   */
  const query = () => {
    state.pageInfo.pageNum = 1;
    getTableList();
  };

  /**
   * @description 表格数据重置
   * 只重置表格以上的参数，表格内部的参数如表头、分页不参与重置
   * @return void
   */
  const reset = () => {
    state.pageInfo.pageNum = 1;
    resetTotalParam();
    getTableList();
  };

  /**
   * @description 刷新表格，回到第一页
   * @return void
   */
  const refresh = () => {
    state.pageInfo.pageNum = 1;
    getTableList();
  };

  /**
   * @description 每页条数改变
   * @param {Number} val 当前条数
   * @return void
   */
  const handleSizeChange = (val: number) => {
    state.pageInfo.pageNum = 1;
    state.pageInfo.pageSize = val;
    putPageSize(val);
    getTableList();
  };

  /**
   * @description 当前页改变
   * @param {Number} val 当前页
   * @return void
   */
  const handleCurrentChange = (val: number) => {
    if (!isPageable) return; // 如果不分页，直接返回，不执行分页操作
    state.pageInfo.pageNum = val;
    getTableList();
  };

  /**
   * @description 记录页面展示条数
   * @param {Number} val 当前页
   * @return void
   */
  const putPageSize = async (val: number) => {
    if (!pageSaveApi) return;
    const params = {
      pageSize: val,
    };
    try {
      Object.assign(params, initColumnParam);
      pageSaveApi(params);
    } catch (error) {
      console.log(error);
    }
  };

  return {
    ...toRefs(state),
    getTableList,
    query,
    reset,
    refresh,
    handleSizeChange,
    handleCurrentChange,
    setPageSize,
    filterProp,
    resizebarRight,
  };
};
