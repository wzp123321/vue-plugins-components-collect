/**
 * 项目 mock 数据
 */
export interface MockProject {
  id: string;
  code: string;
  name: string;
  groupId: string;
  groupName: string;
  campusId: string;
  campusName: string;
}

export const mockProjects: MockProject[] = [
  { id: 'p-1', code: 'P-001', name: '智慧园区一期', groupId: 'g-1', groupName: '核心项目', campusId: 'c-1', campusName: '总部园区' },
  { id: 'p-2', code: 'P-002', name: '智慧园区二期', groupId: 'g-1', groupName: '核心项目', campusId: 'c-1', campusName: '总部园区' },
  { id: 'p-3', code: 'P-003', name: '研发楼改造', groupId: 'g-1', groupName: '核心项目', campusId: 'c-1', campusName: '总部园区' },
  { id: 'p-4', code: 'P-004', name: '上海分园', groupId: 'g-2', groupName: '分园项目', campusId: 'c-2', campusName: '上海园区' },
  { id: 'p-5', code: 'P-005', name: '深圳分园', groupId: 'g-2', groupName: '分园项目', campusId: 'c-3', campusName: '深圳园区' },
  { id: 'p-6', code: 'P-006', name: '成都基地', groupId: 'g-3', groupName: '区域基地', campusId: 'c-4', campusName: '成都基地' },
];

export function searchProjects(keyword: string): MockProject[] {
  const k = keyword.trim().toLowerCase();
  if (!k) return mockProjects;
  return mockProjects.filter(
    (p) => p.name.toLowerCase().includes(k) || p.code.toLowerCase().includes(k) || p.campusName.toLowerCase().includes(k)
  );
}

export function getProjectById(id: string) {
  return mockProjects.find((p) => p.id === id);
}
