import { cloneDeep } from 'lodash';
import { openBlankUrl } from '@/utils/index';

export const AbnormalType = {
  BALANCE: 1, // 能流平衡异常
  RATIO: 2, // 用能异常
  RANK: 3, // 排名变化
  CORRELATION: 4, // 关联分析异常
  PEAK: 5, // 峰值时间异常
  KPI: 6, // 节能考核异常
  BASIS: 7, // 同比异常
  CONTRAST: 8, // 能耗对比异常
  COST: 9, // 成本异常
  BOUNDARY: 10, // 边界异常
};

// 跳转
export const onPageTo = (typeId: number, row: GlobalModule.CommonObject) => {
  let params = cloneDeep(row);
  Object.assign(params, { typeId });
  let path = '';
  switch (typeId) {
    case AbnormalType.BALANCE: // 能流平衡异常
      path += '/web/energyBalance';
      break;
    case AbnormalType.BASIS: // 同比异常
      path += '/web/energyContrast';
      break;
    case AbnormalType.CONTRAST: // 能耗对比异常
      path += '/web/energyContrast';
      break;
    case AbnormalType.CORRELATION: // 关联分析异常
      path += '/web/relationAnalysis';
      break;
    case AbnormalType.COST: // 成本异常
      path += '/web/costAnalysis';
      break;
    case AbnormalType.KPI: // 节能考核异常
      path += '/web/energyConservationAssess';
      break;
    case AbnormalType.PEAK: // 峰值时间异常
      path += '/web/peakology';
      break;
    case AbnormalType.RANK: // 排名变化
      path += '/web/energyRanking';
      const { groupId } = row;
      params = Object.assign(params, { groupIdList: [groupId] });
      break;
    case AbnormalType.BOUNDARY: // 边界异常
    case AbnormalType.RATIO: // 用能异常
      path += '/web/energyAnalysis';
      break;
    default:
      break;
  }
  if (typeId === AbnormalType.RATIO || typeId === AbnormalType.BOUNDARY) {
    window.sessionStorage.setItem('ems-analysis-query-params', JSON.stringify(params));
  } else {
    window.sessionStorage.setItem('ems-energyAbnormalParams', JSON.stringify(params));
  }
  openBlankUrl(path);
};
