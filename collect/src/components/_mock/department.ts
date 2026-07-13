/**
 * 部门 mock 数据
 * 树形结构, id 唯一, parent 关联父节点
 */
export interface MockDeptNode {
  id: string;
  parent: string | null;
  name: string;
  disabled?: boolean;
  children?: MockDeptNode[];
}

export const mockDepartments: MockDeptNode[] = [
  { id: 'root-1', parent: null, name: '天溯集团' },
  { id: 'd-1', parent: 'root-1', name: '研发中心' },
  { id: 'd-1-1', parent: 'd-1', name: '前端组', disabled: true },
  { id: 'd-1-2', parent: 'd-1', name: '后端组' },
  { id: 'd-1-3', parent: 'd-1', name: '测试组' },
  { id: 'd-2', parent: 'root-1', name: '产品中心' },
  { id: 'd-2-1', parent: 'd-2', name: '产品一部' },
  { id: 'd-2-2', parent: 'd-2', name: '产品二部' },
  { id: 'd-3', parent: 'root-1', name: '运营中心' },
  { id: 'd-3-1', parent: 'd-3', name: '市场部' },
  { id: 'd-3-2', parent: 'd-3', name: '客服部' },
];

/** 扁平化 */
export const flatMockDepartments: MockDeptNode[] = (() => {
  const map = new Map<string, MockDeptNode>();
  mockDepartments.forEach((d) => map.set(d.id, { ...d }));
  return Array.from(map.values());
})();

/** 模拟搜索接口: 根据 name 模糊匹配 */
export function searchDepartments(keyword: string): Promise<MockDeptNode[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const k = keyword.trim().toLowerCase();
      if (!k) return resolve([]);
      resolve(flatMockDepartments.filter((d) => d.name.toLowerCase().includes(k)));
    }, 200);
  });
}

/** 模拟懒加载子节点 */
export function loadDeptChildren(parentId: string): Promise<MockDeptNode[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(flatMockDepartments.filter((d) => d.parent === parentId));
    }, 200);
  });
}

/** 模拟批量查节点 */
export function getDeptNodesByIds(ids: string[]): Promise<MockDeptNode[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(flatMockDepartments.filter((d) => ids.includes(d.id)));
    }, 200);
  });
}
