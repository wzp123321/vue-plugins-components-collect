// 公共库
import { reactive, ref } from 'vue';
// 工具方法
import { cloneDeep } from 'lodash';
import { FResHandler } from '@/utils';
import { commonHttp } from '@/api/request';
// 类型
import type { Ec_IChildNodeInfo, Ec_IConsumptionData, Ec_INodeItem, Ec_IQueryParams } from '../energy-consumption.api';
// 枚举
import { Ec_EPath, initialRes } from '../constant/enum';
import type { Common_IHttpResponseImpl } from '@/api/model';

/**
 * 能耗概览模块---业务逻辑
 * @returns
 */
export const useEnergyConsumptionController = () => {
  /**
   * 纵览节点数据
   */
  const scanNodeInfo = reactive<Ec_IConsumptionData>(cloneDeep(initialRes));
  /**
   * 查询纵览数据（第一部分）
   * @param {Ec_IQueryParams} params
   * @returns {Promise<void>}
   */
  const queryNodeSelfData = async (params: Ec_IQueryParams): Promise<void> => {
    const res: Common_IHttpResponseImpl<Ec_IConsumptionData> = await commonHttp.post(
      Ec_EPath.查询能耗纵览总览数据,
      params,
    );
    const result = FResHandler<Ec_IConsumptionData>(res);

    scanNodeInfo.nodeItem.costValue = result?.nodeItem?.costValue ?? null;
    scanNodeInfo.nodeItem.costUnit = result?.nodeItem?.costUnit ?? '';
    scanNodeInfo.nodeItem.energyUnit = result?.nodeItem?.energyUnit ?? '';
    scanNodeInfo.nodeItem.energyValue = result?.nodeItem?.energyValue ?? null;
    scanNodeInfo.nodeItem.itemId = result?.nodeItem?.itemId !== null ? result?.nodeItem?.itemId + '' : '';
    scanNodeInfo.nodeItem.itemName = result?.nodeItem?.itemName ?? '';
    scanNodeInfo.nodeItem.lastMonthPercent = result?.nodeItem?.lastMonthPercent ?? null;
    scanNodeInfo.nodeItem.lastYearPercent = result?.nodeItem?.lastYearPercent ?? null;
    scanNodeInfo.nodeItem.percent = result?.nodeItem?.percent ?? '';
    scanNodeInfo.nodeItem.parentItemName = result?.nodeItem?.parentItemName ?? '';
    scanNodeInfo.nodeItem.strCostValue = result?.nodeItem?.strCostValue ?? '';
    scanNodeInfo.nodeItem.percentValue = result?.nodeItem?.percentValue ?? null;
    scanNodeInfo.nodeItem.hasChildren = result?.nodeItem?.hasChildren !== null ? result?.nodeItem?.hasChildren : false;
    scanNodeInfo.childrenItem =
      result?.childrenItem?.map((item) => ({
        costValue: item?.costValue ?? null,
        costUnit: item?.costUnit ?? '',
        energyUnit: item?.energyUnit ?? '',
        energyValue: item?.energyValue ?? null,
        itemId: item?.itemId !== null ? item?.itemId + '' : '',
        itemName: item?.itemName ?? '',
        lastMonthPercent: item?.lastMonthPercent ?? null,
        lastYearPercent: item?.lastYearPercent ?? null,
        lastMonthCostPercent: item?.lastMonthCostPercent ?? null,
        lastYearCostPercent: item?.lastYearCostPercent ?? null,
        percent: item?.percent ?? null,
        parentItemName: item?.parentItemName ?? '',
        percentValue: item?.percentValue ?? null,
        strCostValue: item?.strCostValue ?? '',
        hasChildren: item?.hasChildren !== null ? item?.hasChildren : false,
        children: [],
      })) ?? [];
    scanNodeInfo.childrenItemHead = result.childrenItemHead;
    console.log('%c✨✨查询能耗纵览数据✨✨', 'font-size: 24px', scanNodeInfo);
  };

  /**
   * 节点列表
   */
  const childNodeList = ref<Ec_IChildNodeInfo[]>([]);
  /**
   * 查询子节点列表
   * @param {string} treeId
   * @param {string} energyCode
   * @returns {Promise<void>}
   */
  const queryChildNodeList = async (treeId: string, energyCode: string): Promise<void> => {
    const res: Common_IHttpResponseImpl<Ec_IChildNodeInfo[]> = await commonHttp.post(Ec_EPath.查询纵览子节点列表, {
      treeId,
      energyCode,
    });
    const result = FResHandler<Ec_IChildNodeInfo[]>(res);
    childNodeList.value =
      result?.map((item) => {
        return {
          itemId: item?.itemId !== null ? item?.itemId + '' : '',
          itemName: item?.itemName ?? '',
          hasChildren: item?.hasChildren !== null ? item?.hasChildren : false,
        };
      }) ?? [];
    console.log('%c✨✨查询能耗纵览子节点✨✨', 'font-size: 24px', result);
  };

  /**
   * 子节点详情
   */
  const childNodeDetail = reactive<Ec_IConsumptionData>(cloneDeep(initialRes));
  /**
   * 查询子节点相关信息
   * @param {Ec_IQueryParams} params
   * @returns {Promise<void>}
   */
  const queryChildrenDetailById = async (params: Ec_IQueryParams): Promise<void> => {
    const res: Common_IHttpResponseImpl<Ec_IConsumptionData> = await commonHttp.post(
      Ec_EPath.根据子节点id查询子节点信息,
      params,
    );
    const result = FResHandler<Ec_IConsumptionData>(res);
    childNodeDetail.nodeItem.costValue = result?.nodeItem?.costValue ?? null;
    childNodeDetail.nodeItem.costUnit = result?.nodeItem?.costUnit ?? '';
    childNodeDetail.nodeItem.energyUnit = result?.nodeItem?.energyUnit ?? '';
    childNodeDetail.nodeItem.energyValue = result?.nodeItem?.energyValue ?? null;
    childNodeDetail.nodeItem.itemId = result?.nodeItem?.itemId !== null ? result?.nodeItem?.itemId + '' : '';
    childNodeDetail.nodeItem.itemName = result?.nodeItem?.itemName ?? '';
    childNodeDetail.nodeItem.lastMonthPercent = result?.nodeItem?.lastMonthPercent ?? null;
    childNodeDetail.nodeItem.lastYearPercent = result?.nodeItem?.lastYearPercent ?? null;
    childNodeDetail.nodeItem.lastMonthCostPercent = result?.nodeItem?.lastMonthCostPercent ?? null;
    childNodeDetail.nodeItem.lastYearCostPercent = result?.nodeItem?.lastYearCostPercent ?? null;
    childNodeDetail.nodeItem.percent = result?.nodeItem?.percent ?? '';
    childNodeDetail.nodeItem.parentItemName = result?.nodeItem?.parentItemName ?? '';
    childNodeDetail.nodeItem.strCostValue = result?.nodeItem?.strCostValue ?? '';
    childNodeDetail.nodeItem.percentValue = result?.nodeItem?.percentValue ?? null;
    childNodeDetail.nodeItem.hasChildren =
      result?.nodeItem?.hasChildren !== null ? result?.nodeItem?.hasChildren : false;
    childNodeDetail.childrenItem =
      result?.childrenItem?.map((item) => ({
        costValue: item?.costValue ?? null,
        costUnit: item?.costUnit ?? '',
        energyUnit: result?.nodeItem?.energyUnit ?? '',
        energyValue: item?.energyValue ?? null,
        itemId: item?.itemId !== null ? item?.itemId + '' : '',
        itemName: item?.itemName ?? '',
        lastMonthPercent: item?.lastMonthPercent ?? null,
        lastYearPercent: item?.lastYearPercent ?? null,
        lastMonthCostPercent: item?.lastMonthCostPercent ?? null,
        lastYearCostPercent: item?.lastYearCostPercent ?? null,
        percent: item?.percent ?? null,
        parentItemName: item?.parentItemName ?? '',
        percentValue: item?.percentValue ?? null,
        strCostValue: item?.strCostValue ?? '',
        hasChildren: item?.hasChildren !== null ? item?.hasChildren : false,
        children: [],
      })) ?? [];
    childNodeDetail.childrenItemHead = result.childrenItemHead;
    console.log('%c✨✨根据子节点id查询子节点信息✨✨', 'font-size: 24px', childNodeDetail);
  };

  /**
   * 查询子节点相关信息
   * @param {Ec_IQueryParams} params
   */
  const queryChildrenListById = async (params: Ec_IQueryParams) => {
    const res: Common_IHttpResponseImpl<Ec_IConsumptionData> = await commonHttp.post(
      Ec_EPath.根据子节点id查询子节点信息,
      params,
    );
    const result = FResHandler<Ec_IConsumptionData>(res);
    return new Promise<Ec_INodeItem[]>((resolve, reject) => {
      resolve(
        result?.childrenItem?.map((item) => ({
          costValue: item?.costValue ?? null,
          costUnit: item?.costUnit ?? '',
          energyUnit: item?.energyUnit ?? '',
          energyValue: item?.energyValue ?? null,
          itemId: item?.itemId !== null ? item?.itemId + '' : '',
          itemName: item?.itemName ?? '',
          lastMonthPercent: item?.lastMonthPercent ?? null,
          lastYearPercent: item?.lastYearPercent ?? null,
          lastMonthCostPercent: item?.lastMonthCostPercent ?? null,
          lastYearCostPercent: item?.lastYearCostPercent ?? null,
          percent: item?.percent ?? null,
          parentItemName: item?.parentItemName ?? '',
          percentValue: item?.percentValue ?? null,
          strCostValue: item?.strCostValue ?? '-',
          hasChildren: item?.hasChildren !== null ? item?.hasChildren : false,
          children: [],
          loading: false,
        })) ?? [],
      );
    });
  };

  return {
    scanNodeInfo,
    childNodeList,
    childNodeDetail,

    queryNodeSelfData,
    queryChildNodeList,
    queryChildrenDetailById,
    queryChildrenListById,
  };
};
