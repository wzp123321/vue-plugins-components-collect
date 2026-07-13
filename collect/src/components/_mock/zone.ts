/**
 * mock 空间分区树
 */
export interface MockZone {
  id: string;
  name: string;
  parent: string | null;
  hasChildren?: boolean;
  children?: MockZone[];
}

export const mockZoneTree: MockZone[] = [
  {
    id: 'all',
    name: '全部分区',
    parent: null,
    hasChildren: false,
  },
  {
    id: 'z-1',
    name: 'A 区',
    parent: null,
    hasChildren: true,
    children: [
      { id: 'z-1-1', name: 'A1 栋', parent: 'z-1', hasChildren: true, children: [
        { id: 'z-1-1-1', name: 'A1 公共区', parent: 'z-1-1' },
        { id: 'z-1-1-2', name: 'A1 办公区', parent: 'z-1-1' },
      ] },
      { id: 'z-1-2', name: 'A2 栋', parent: 'z-1' },
    ],
  },
  {
    id: 'z-2',
    name: 'B 区',
    parent: null,
    hasChildren: true,
    children: [
      { id: 'z-2-1', name: 'B1 栋', parent: 'z-2' },
      { id: 'z-2-2', name: 'B2 栋', parent: 'z-2', hasChildren: true, children: [
        { id: 'z-2-2-1', name: 'B2 商业区', parent: 'z-2-2' },
      ] },
    ],
  },
  {
    id: 'z-3',
    name: 'C 区',
    parent: null,
    hasChildren: false,
  },
];

export function loadZoneChildren(id: string, keyword?: string): Promise<MockZone[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const find = (list: MockZone[]): MockZone | undefined => {
        for (const n of list) {
          if (n.id === id) return n;
          if (n.children) {
            const c = find(n.children);
            if (c) return c;
          }
        }
      };
      const node = find(mockZoneTree);
      const list = (node?.children || []).filter((c) => {
        if (!keyword) return true;
        return c.name.includes(keyword);
      });
      resolve(list);
    }, 200);
  });
}

export function searchZones(keyword: string): Promise<MockZone[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const result: MockZone[] = [];
      const walk = (list: MockZone[]) => {
        list.forEach((n) => {
          if (n.name.includes(keyword)) result.push(n);
          if (n.children) walk(n.children);
        });
      };
      walk(mockZoneTree);
      resolve(result);
    }, 200);
  });
}
