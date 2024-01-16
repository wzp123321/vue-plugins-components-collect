/*
 * @Author: yut
 * @Date: 2023-07-31 10:59:50
 * @LastEditors: yut
 * @LastEditTime: 2023-08-25 16:51:32
 * @Descripttion:
 */
/**
 * 能源类型
 */
export enum EEnergyType {
  电 = '01000',
  水 = '02000',
  燃气 = '03000',
}

/**
 * 模板类型
 */
export enum ETemplateType {
  分时模板 = '1',
  平价模板 = '2',
}

/**
 * 编辑类型
 */
export enum EEditType {
  修改 = '修改',
  新增 = '新增',
}

export enum EPath {
  分页查询费率模板 = '/rate/queryRateList',
  新增费率模板 = '/rate/addRate',
  更新费率模板 = '/rate/updateRate',
  获取能源类型 = '/admin/energy/code/listEnergyParentCodeExcludeTotal',
  获取模板类型 = '/dict/query',
}

// 费率模板列表
export interface ER_IRateTemplateList {
  effectiveTime: string;
  energyCode: string;
  energyCodeName: string;
  energyUnit: string;
  expirationTime: string;
  flat: number;
  id: number;
  parity: number;
  peak: number;
  sharp: number;
  templateType: string;
  templateTypeText: string;
  updateTime: string;
  valley: number;
}

/**
 * 新增/编辑费率模板数据
 */
export interface ER_ITemplateEditData {
  effectiveTime: string | null;
  expirationTime: string | null;
  energyCode?: string;
  id?: number;
  templateType: string;
  parity: string | number | null;
  sharp: string | number | null;
  peak: string | number | null;
  flat: string | number | null;
  valley: string | number | null;
}
