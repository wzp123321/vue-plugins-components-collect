/*
 * @Author: yut
 * @Date: 2023-10-31 12:29:27
 * @LastEditors: yut
 * @LastEditTime: 2023-12-28 10:29:26
 * @Descripttion:
 */
import { ESA_EStatus, ESA_EStatusColor } from '@/pages/energy-saving-assessment/energy-saving-assessment.api';

/**
 * 根据状态显示对应的配色
 * @param status 状态
 */
export const mapStatusColor = (status: string) => {
  let color = '';
  switch (status) {
    case ESA_EStatus.盈余:
      color = ESA_EStatusColor.盈余;
      break;
    case ESA_EStatus.警告:
      color = ESA_EStatusColor.警告;
      break;
    case ESA_EStatus.超支:
      color = ESA_EStatusColor.超支;
      break;
    default:
      color = ESA_EStatusColor.盈余;
      break;
  }
  return color;
};
