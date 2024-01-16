/*
 * @Author: wanzp
 * @Date: 2023-05-04 14:39:35
 * @LastEditors: wanzp wanzp@tiansu-china.com
 * @LastEditTime: 2023-12-12 17:26:06
 * @Description: 公共查询接口地址
 */
export enum ECommonPath {
  查询托管范围 = '/baseHead/queryHostingScope',
  查询托管年份 = '/baseHead/queryHostingYears',
  '根据建设期、运营期查询托管年份' = '/baseHead/queryHostingYearsByValueType',
  查询能源类型 = '/baseHead/queryEnergyType',
  查询托管期信息 = '/baseHead/queryHostingPeriods',
  根据分类分析查询此租户的托管区域 = '/baseHead/queryHostingAreaByEnergyCode',
  '查询n托管期信息 （根据户号录入最新时间进行截止）' = '/energyControl/queryHostingPeriodsByAccount',
  查询户号录入最新时间 = '/energyControl/queryAccountLastTime',
  保活 = '/keepAlive',
  查询用户角色 = '/role/queryUserRole'
}
