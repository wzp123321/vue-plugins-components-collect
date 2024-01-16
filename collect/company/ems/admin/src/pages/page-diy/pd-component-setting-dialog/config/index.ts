/*
 * @Author: yut
 * @Date: 2023-11-27 15:37:41
 * @LastEditors: yut
 * @LastEditTime: 2023-11-28 10:44:21
 * @Descripttion:
 */
// 设置类型枚举
export enum SETTING_TYPES {
  PROJECT_PRODUCTION = 'ZJ001', // 项目介绍
  SEQUENTIAL_SURVEY = 'ZJ002', // 同环比概览
  KPI = 'ZJ003', // KPI仪表盘
  ENERGY_RANK = 'ZJ004', // 能耗排名
  EMPHASIS_AREA_ENERGY = 'ZJ005', // 重点区域用能
  ENERGY_COST_ANALYSIS = 'ZJ006', // 能源成本分析
  ALARM_EVENT_ANALYSIS = 'ZJ007', // 告警事件分析
  SLIDE_ENERGY_COMPONENT = 'ZJ008', // 滑动能耗组件
  DEVICE_STATUS_MONITORING = 'ZJ009', // 设备状态监控
  ENERGY_SUBENTRY_PROPORTION = 'ZJ01-', // 用能分项占比
  RELATION_ANALYSIS = 'ZJ011', // 关联分析
  PROJECT_POINT_SURVEY = 'ZJ012', // 项目点位概览
  UNIT_AREA_ENERGY_RANK = 'ZJ013', // 单位面积能耗排名
  ENERGY_ITEM_RATIO = 'ZJ010', // 用能分项
}

// 设置同环比类型 能源类型字典
export const ENERGYCODE = [
  { label: '总能耗', code: '00000' },
  { label: '电', code: '01000' },
  { label: '集中供热量', code: '04000' },
  { label: '水', code: '02000' },
  { label: '燃气', code: '03000' },
  { label: '集中供冷量', code: '05000' },
];
