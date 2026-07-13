/**
 * 员工组 mock 数据
 */
export interface MockEmployeeGroup {
  id: string;
  name: string;
  memberCount: number;
  description?: string;
  memberIds: string[];
}

export const mockEmployeeGroups: MockEmployeeGroup[] = [
  {
    id: 'g-1',
    name: '研发一组',
    memberCount: 5,
    description: '核心研发团队',
    memberIds: ['u-1', 'u-2', 'u-3', 'u-4', 'u-5'],
  },
  {
    id: 'g-2',
    name: '产品一组',
    memberCount: 2,
    description: '负责产品规划',
    memberIds: ['u-6', 'u-7'],
  },
  {
    id: 'g-3',
    name: '运营组',
    memberCount: 2,
    description: '市场运营',
    memberIds: ['u-9', 'u-10'],
  },
  {
    id: 'g-4',
    name: '外包团队',
    memberCount: 1,
    description: '外部协作',
    memberIds: ['u-8'],
  },
];

export function searchEmployeeGroups(keyword: string): Promise<MockEmployeeGroup[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const k = keyword.trim().toLowerCase();
      if (!k) return resolve(mockEmployeeGroups);
      resolve(mockEmployeeGroups.filter((g) => g.name.toLowerCase().includes(k)));
    }, 200);
  });
}
