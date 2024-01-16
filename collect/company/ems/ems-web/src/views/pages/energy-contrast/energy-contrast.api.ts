// 对比类型
export enum EContrastType {
  多对象 = 1,
  多时间 = 2,
}

// 多时间快捷选时类型
export enum EMultipleTimeType {
  日 = 0,
  周 = 1,
  月 = 2,
  年 = 3,
  任意时间段 = 4,
}

export const defaultProps = {
  children: 'childEnergyCode',
  label: 'name',
};
export const defaultPropsTreeSelect = {
  children: 'childTree',
  label: 'treeName',
};

// 月、年回调参数
export interface EC_IMultipleCbVO {
  value: number;
  key: boolean;
  year: number;
}
