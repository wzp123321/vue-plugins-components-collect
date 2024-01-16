export enum CD_ETableSize {
  默认 = 'medium',
  紧凑 = 'mini',
}
export interface CD_TableHeader {
  name: string;
  widthNumber: number;
}

export interface CD_TableData {
  id?: number;
  label?: string;
  newLabel?: string;
}

export interface CD_TableDataOld {
  id: number;
  name: string;
}

export interface CD_TableScreenType {
  id: number;
  name: string;
  selectd?: boolean;
}

export const enum CD_TableHeaderName {
  '项目 (项目任务 (MD))',
  null,
  '总账科目（来源）',
  '',
  '成本明细',
  '对应客户/供应商编号',
  ' ',
  人员部门,
  人员类别,
  产品,
  '  ',
  产品类别,
  过账日期,
  年份,
  月份,
  日记账分录,
  日记账分录类型,
  日记账分录抬头文本,
  '   ',
  创建时间,
  公司货币余额,
  评估数量,
  成本类别,
}
