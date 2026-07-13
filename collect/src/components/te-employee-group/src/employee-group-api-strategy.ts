/**
 * 员工组 API 策略模式(简化复刻)
 */
import type { MockEmployeeGroup } from '../../_mock/employee-group';

export interface EmployeeGroupApiStrategy {
  mode: 'standard' | 'cloud';
  search: (keyword: string) => Promise<MockEmployeeGroup[]>;
  loadByMemberIds: (memberIds: string[]) => Promise<MockEmployeeGroup[]>;
}

const standardStrategy: EmployeeGroupApiStrategy = {
  mode: 'standard',
  search: async (keyword) => {
    const { searchEmployeeGroups } = await import('../../_mock/employee-group');
    return searchEmployeeGroups(keyword);
  },
  loadByMemberIds: async (memberIds) => {
    const { mockEmployeeGroups } = await import('../../_mock/employee-group');
    if (!memberIds.length) return mockEmployeeGroups;
    return mockEmployeeGroups.filter((g) => g.memberIds.some((m) => memberIds.includes(m)));
  },
};

const cloudStrategy: EmployeeGroupApiStrategy = {
  mode: 'cloud',
  search: async () => [],
  loadByMemberIds: async () => [],
};

export function getEmployeeGroupApiByMode(mode: 'standard' | 'cloud'): EmployeeGroupApiStrategy {
  return mode === 'cloud' ? cloudStrategy : standardStrategy;
}

/** 模板 code → 真实 id 转换(简化) */
export async function templateCodeToId(code: string): Promise<string> {
  return `tpl-${code}`;
}
