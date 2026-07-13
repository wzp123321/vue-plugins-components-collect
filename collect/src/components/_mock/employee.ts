/**
 * 员工 mock 数据
 */
import { flatMockDepartments } from './department';

export interface MockEmployee {
  id: string;
  name: string;
  account: string;
  phone: string;
  email: string;
  departmentId: string;
  positionId?: string;
  avatar?: string;
  disabled?: boolean;
}

export const mockEmployees: MockEmployee[] = [
  { id: 'u-1', name: '张三', account: 'zhangsan', phone: '13800000001', email: 'zhangsan@example.com', departmentId: 'd-1-1', positionId: 'p-1' },
  { id: 'u-2', name: '李四', account: 'lisi', phone: '13800000002', email: 'lisi@example.com', departmentId: 'd-1-1', positionId: 'p-2' },
  { id: 'u-3', name: '王五', account: 'wangwu', phone: '13800000003', email: 'wangwu@example.com', departmentId: 'd-1-2', positionId: 'p-1' },
  { id: 'u-4', name: '赵六', account: 'zhaoliu', phone: '13800000004', email: 'zhaoliu@example.com', departmentId: 'd-1-2', positionId: 'p-3' },
  { id: 'u-5', name: '孙七', account: 'sunqi', phone: '13800000005', email: 'sunqi@example.com', departmentId: 'd-1-3', positionId: 'p-1' },
  { id: 'u-6', name: '周八', account: 'zhouba', phone: '13800000006', email: 'zhouba@example.com', departmentId: 'd-2-1', positionId: 'p-2' },
  { id: 'u-7', name: '吴九', account: 'wujiu', phone: '13800000007', email: 'wujiu@example.com', departmentId: 'd-2-1', positionId: 'p-3' },
  { id: 'u-8', name: '郑十', account: 'zhengshi', phone: '13800000008', email: 'zhengshi@example.com', departmentId: 'd-2-2', positionId: 'p-1', disabled: true },
  { id: 'u-9', name: '钱多多', account: 'qianduoduo', phone: '13800000009', email: 'qian@example.com', departmentId: 'd-3-1', positionId: 'p-2' },
  { id: 'u-10', name: '冯小二', account: 'feng', phone: '13800000010', email: 'feng@example.com', departmentId: 'd-3-2', positionId: 'p-1' },
];

export const mockPositions = [
  { id: 'p-1', name: '工程师' },
  { id: 'p-2', name: '产品经理' },
  { id: 'p-3', name: '设计师' },
];

/** 模拟员工搜索 */
export function searchEmployees(keyword: string): Promise<MockEmployee[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const k = keyword.trim().toLowerCase();
      if (!k) return resolve([]);
      resolve(
        mockEmployees.filter(
          (e) => e.name.toLowerCase().includes(k) || e.account.toLowerCase().includes(k) || e.phone.includes(k)
        )
      );
    }, 200);
  });
}

/** 模拟按部门加载员工 */
export function loadEmployeesByDept(deptId: string): Promise<MockEmployee[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const ids = collectDeptIds(deptId, flatMockDepartments);
      resolve(mockEmployees.filter((e) => ids.includes(e.departmentId)));
    }, 200);
  });
}

function collectDeptIds(rootId: string, all: any[]): string[] {
  const ids = [rootId];
  let added = true;
  while (added) {
    added = false;
    all.forEach((d) => {
      if (d.parent && ids.includes(d.parent) && !ids.includes(d.id)) {
        ids.push(d.id);
        added = true;
      }
    });
  }
  return ids;
}
