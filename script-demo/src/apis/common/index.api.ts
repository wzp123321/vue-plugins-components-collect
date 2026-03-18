// 表格列类型
export interface CommonTableColType {
  id: number;
  appId: string;
  align: string;
  checked: boolean;
  disabled: boolean;
  empId: string;
  filter: boolean;
  label: string;
  order: number;
  orgId: string;
  prop: string;
  show: boolean;
  sortable: boolean;
  tableCode: string;
  tenantId: string;
  twoLines: number | number;
  width: number | number;
}

// 列接口返回类型
export interface ReturnColType {
  pageSize?: number;
  tableCode: string;
  columns: Array<CommonTableColType>;
}
export interface ProjectType {
  id: string;
  name: string;
}
