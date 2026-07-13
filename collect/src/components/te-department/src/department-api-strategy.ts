/**
 * 部门 API 策略模式(简化复刻)
 * 真实环境下 standard 走本地接口, cloud 走云端模板
 * 这里只返回函数对象
 */
export interface DepartmentApiStrategy {
  mode: 'standard' | 'cloud';
  loadChildren: (parentId: string) => Promise<any[]>;
  search: (keyword: string) => Promise<any[]>;
}

const standardStrategy: DepartmentApiStrategy = {
  mode: 'standard',
  loadChildren: async (parentId) => {
    const { flatMockDepartments } = await import('../../_mock/department');
    return flatMockDepartments.filter((d) => d.parent === parentId);
  },
  search: async (keyword) => {
    const { searchDepartments } = await import('../../_mock/department');
    return searchDepartments(keyword);
  },
};

const cloudStrategy: DepartmentApiStrategy = {
  mode: 'cloud',
  loadChildren: async () => {
    // 模拟云端
    return new Promise((resolve) => {
      setTimeout(() => resolve([]), 200);
    });
  },
  search: async () => [],
};

export function getDepartmentApiByMode(mode: 'standard' | 'cloud'): DepartmentApiStrategy {
  return mode === 'cloud' ? cloudStrategy : standardStrategy;
}
