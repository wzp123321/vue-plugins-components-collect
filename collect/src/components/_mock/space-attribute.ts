/**
 * mock 空间功能属性树
 */
export interface MockSpaceAttr {
  id: string;
  name: string;
  parent?: string | null;
  disabled?: boolean;
  children?: MockSpaceAttr[];
}

export const mockSpaceAttributes: MockSpaceAttr[] = [
  {
    id: 'sa-1',
    name: '安全防范',
    disabled: true,
    children: [
      {
        id: 'sa-1-1',
        name: '视频监控',
        children: [
          { id: 'sa-1-1-1', name: '出入口监控' },
          { id: 'sa-1-1-2', name: '周界监控' },
          { id: 'sa-1-1-3', name: '公共区域' },
        ],
      },
      {
        id: 'sa-1-2',
        name: '门禁系统',
        children: [
          { id: 'sa-1-2-1', name: '人员门禁' },
          { id: 'sa-1-2-2', name: '车辆门禁' },
        ],
      },
    ],
  },
  {
    id: 'sa-2',
    name: '消防',
    disabled: true,
    children: [
      {
        id: 'sa-2-1',
        name: '火灾报警',
        children: [
          { id: 'sa-2-1-1', name: '烟感' },
          { id: 'sa-2-1-2', name: '温感' },
        ],
      },
      {
        id: 'sa-2-2',
        name: '消防设施',
        children: [
          { id: 'sa-2-2-1', name: '灭火器' },
          { id: 'sa-2-2-2', name: '消防栓' },
        ],
      },
    ],
  },
  {
    id: 'sa-3',
    name: '能源管理',
    disabled: true,
    children: [
      {
        id: 'sa-3-1',
        name: '电力',
        children: [
          { id: 'sa-3-1-1', name: '强电' },
          { id: 'sa-3-1-2', name: '弱电' },
        ],
      },
      {
        id: 'sa-3-2',
        name: '水务',
        children: [
          { id: 'sa-3-2-1', name: '给水' },
          { id: 'sa-3-2-2', name: '排水' },
        ],
      },
    ],
  },
];

export function flatSpaceAttrs(tree: MockSpaceAttr[]): MockSpaceAttr[] {
  const out: MockSpaceAttr[] = [];
  const walk = (list: MockSpaceAttr[]) => {
    list.forEach((n) => {
      out.push(n);
      if (n.children) walk(n.children);
    });
  };
  walk(tree);
  return out;
}
