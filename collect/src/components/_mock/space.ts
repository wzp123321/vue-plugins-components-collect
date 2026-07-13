/**
 * 空间 mock 数据(树形)
 */
export interface MockSpaceNode {
  id: string;
  name: string;
  parent: string | null;
  type: 'building' | 'floor' | 'room';
  area?: number;
  children?: MockSpaceNode[];
}

export const mockSpaceTree: MockSpaceNode[] = [
  {
    id: 's-1',
    name: 'A 栋',
    parent: null,
    type: 'building',
    children: [
      { id: 's-1-1', name: '1 层', parent: 's-1', type: 'floor', children: [
        { id: 's-1-1-1', name: '101 室', parent: 's-1-1', type: 'room', area: 80 },
        { id: 's-1-1-2', name: '102 室', parent: 's-1-1', type: 'room', area: 60 },
      ] },
      { id: 's-1-2', name: '2 层', parent: 's-1', type: 'floor', children: [
        { id: 's-1-2-1', name: '201 室', parent: 's-1-2', type: 'room', area: 120 },
        { id: 's-1-2-2', name: '202 室', parent: 's-1-2', type: 'room', area: 100 },
      ] },
    ],
  },
  {
    id: 's-2',
    name: 'B 栋',
    parent: null,
    type: 'building',
    children: [
      { id: 's-2-1', name: '1 层', parent: 's-2', type: 'floor', children: [
        { id: 's-2-1-1', name: '101 室', parent: 's-2-1', type: 'room', area: 50 },
      ] },
    ],
  },
];

export function flatMockSpaces(): MockSpaceNode[] {
  const result: MockSpaceNode[] = [];
  const walk = (list: MockSpaceNode[]) => {
    list.forEach((n) => {
      result.push(n);
      if (n.children) walk(n.children);
    });
  };
  walk(mockSpaceTree);
  return result;
}

export function searchSpaces(keyword: string): Promise<MockSpaceNode[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const k = keyword.trim().toLowerCase();
      const all = flatMockSpaces();
      if (!k) return resolve([]);
      resolve(all.filter((n) => n.name.toLowerCase().includes(k)));
    }, 200);
  });
}
