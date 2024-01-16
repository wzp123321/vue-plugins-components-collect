import message from '@/utils/message';
import { EContrastType } from '../energy-contrast.api';
import { differenceInDays, differenceInHours } from 'date-fns';

// 校验表单
export const onContrastFormParamsCheck = (
  params: GlobalModule.CommonObject,
  contrastTypeValue: number,
  chooseTimeList: string[],
) => {
  let flag = true;
  if (!params.energyCode || params.energyCode?.length === 0) {
    message.error('请选择能源类型！');
    flag = false;
    return;
  }
  if (!params.treeIds || params.treeIds?.length === 0) {
    message.error('请选择分析对象！');
    flag = false;
    return;
  }
  if (mapMultiObjectFlag(contrastTypeValue) && (!params.queryTimeList || params.queryTimeList?.length === 0)) {
    message.error('请选择日期！');
    flag = false;
    return;
  }
  if (mapMultiTimeFlag(contrastTypeValue) && (!chooseTimeList || chooseTimeList?.length === 0)) {
    message.error('请选择日期！');
    flag = false;
    return;
  }

  if (
    mapMultiObjectFlag(contrastTypeValue) &&
    params.timeUnit === '10m' &&
    params.queryTimeList &&
    params.queryTimeList?.length === 2 &&
    differenceInHours(params.queryTimeList[1], params.queryTimeList[0]) > 24
  ) {
    message.error('当前颗粒度下日期跨度不能超过24h');
    flag = false;
    return;
  }
  if (
    mapMultiObjectFlag(contrastTypeValue) &&
    params.timeUnit === '1h' &&
    params.queryTimeList &&
    params.queryTimeList?.length === 2 &&
    differenceInDays(params.queryTimeList[1], params.queryTimeList[0]) > 30
  ) {
    message.error('当前颗粒度下日期跨度不能超过31天');
    flag = false;
    return;
  }
  if (
    mapMultiObjectFlag(contrastTypeValue) &&
    params.timeUnit === '1d' &&
    params.queryTimeList &&
    params.queryTimeList?.length === 2 &&
    differenceInDays(params.queryTimeList[1], params.queryTimeList[0]) > 365
  ) {
    message.error('当前颗粒度下日期跨度不能超过366天');
    flag = false;
    return;
  }
  if (mapMultiObjectFlag(contrastTypeValue) && params.treeIds && params.treeIds?.length < 2) {
    message.error('请至少选择2个分析对象！');
    flag = false;
    return;
  }
  if (mapMultiTimeFlag(contrastTypeValue) && chooseTimeList && chooseTimeList?.length < 2) {
    message.error('请至少选择2个日期！');
    flag = false;
    return;
  }

  return flag;
};

// 校验报告导出参数
export const onContrastExportParamsCheck = (params: GlobalModule.CommonObject) => {
  let flag = true;
  if (!params.energyCode) {
    message.error('请选择能源类型！');
    flag = false;
    return;
  }
  if (!params.treeIds || params.treeIds?.length === 0) {
    message.error('请选择分析对象！');
    flag = false;
    return;
  }
  if (
    params.queryFlag === EContrastType.多对象 &&
    (!params.queryTime || !params.queryTime.endTime || !params.queryTime.startTime)
  ) {
    message.error('请选择日期！');
    flag = false;
    return;
  }
  if (params.queryFlag === EContrastType.多时间 && (!params.multiTimeList || params.multiTimeList?.length === 0)) {
    message.error('请选择日期！');
    flag = false;
    return;
  }
  if (params.queryFlag === EContrastType.多对象 && params.treeIds && params.treeIds?.length < 2) {
    message.error('请至少选择2个分析对象！');
    flag = false;
    return;
  }
  if (params.queryFlag === EContrastType.多时间 && params.multiTimeList && params.multiTimeList?.length < 2) {
    message.error('请至少选择2个日期！');
    flag = false;
    return;
  }
  return flag;
};
/**
 * 获取节点数组
 * @param list
 * @param filterKey
 * @param filterbValue
 * @returns
 */
export function getTreeAllChildIds(
  list: GlobalModule.CommonObject[],
  filterKey: string = 'lockFlag',
  filterbValue: boolean = true,
) {
  if (!list || list?.length === 0) {
    return [];
  }
  const ids: number[] = [];
  function getIds(list: GlobalModule.CommonObject[]) {
    list.forEach((item) => {
      if (item[filterKey] !== filterbValue) {
        ids.push(item?.id);
      }

      if (item?.childTree?.length) {
        getIds(item?.childTree);
      }
    });
  }
  getIds(list);

  return ids;
}

/**
 * 是否是多对象
 * @param contrastType
 * @returns
 */
export const mapMultiObjectFlag = (contrastType: EContrastType) => {
  return contrastType === EContrastType.多对象;
};
/**
 * 是否是多时间
 * @param contrastType
 * @returns
 */
export const mapMultiTimeFlag = (contrastType: EContrastType) => {
  return contrastType === EContrastType.多时间;
};
