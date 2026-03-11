export type EmployeeType = '全职' | '兼职' | '实习' | '外包';
export type Gender = '男' | '女';
export interface Employee {
  id: number;
  name: string;
  type: EmployeeType;
  gender: Gender;
  departed: boolean;
}

