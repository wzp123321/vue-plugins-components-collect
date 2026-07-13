/**
 * 图标库 mock
 */
export interface MockIcon {
  id: string;
  name: string;
  url: string;
  categoryId: string;
  purpose: string;
}

export interface MockIconCategory {
  id: string;
  name: string;
}

export const mockIconCategories: MockIconCategory[] = [
  { id: 'c-1', name: '通用' },
  { id: 'c-2', name: '安全' },
  { id: 'c-3', name: '能源' },
  { id: 'c-4', name: '设备' },
  { id: 'c-5', name: '人员' },
];

// 用 SVG 字符串转 dataURL 当作占位
const makeSvgUrl = (label: string, color = '#409eff') => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
    <rect width="80" height="80" fill="#fafbfc" stroke="#ebeef5" stroke-width="1"/>
    <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="14" fill="${color}">${label}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const mockIconLib: MockIcon[] = [
  { id: 'i-1', name: '门禁', url: makeSvgUrl('门禁', '#409eff'), categoryId: 'c-1', purpose: 'default' },
  { id: 'i-2', name: '摄像头', url: makeSvgUrl('摄像', '#67c23a'), categoryId: 'c-1', purpose: 'default' },
  { id: 'i-3', name: '消防栓', url: makeSvgUrl('消防', '#f56c6c'), categoryId: 'c-2', purpose: 'default' },
  { id: 'i-4', name: '灭火器', url: makeSvgUrl('灭火', '#e6a23c'), categoryId: 'c-2', purpose: 'default' },
  { id: 'i-5', name: '电表', url: makeSvgUrl('电表', '#909399'), categoryId: 'c-3', purpose: 'default' },
  { id: 'i-6', name: '水表', url: makeSvgUrl('水表', '#67c23a'), categoryId: 'c-3', purpose: 'default' },
  { id: 'i-7', name: '空调', url: makeSvgUrl('空调', '#409eff'), categoryId: 'c-4', purpose: 'default' },
  { id: 'i-8', name: '电梯', url: makeSvgUrl('电梯', '#909399'), categoryId: 'c-4', purpose: 'default' },
  { id: 'i-9', name: '巡更', url: makeSvgUrl('巡更', '#67c23a'), categoryId: 'c-5', purpose: 'default' },
  { id: 'i-10', name: '访客', url: makeSvgUrl('访客', '#e6a23c'), categoryId: 'c-5', purpose: 'default' },
  { id: 'i-11', name: '围栏', url: makeSvgUrl('围栏', '#f56c6c'), categoryId: 'c-2', purpose: 'default' },
  { id: 'i-12', name: '照明', url: makeSvgUrl('照明', '#e6a23c'), categoryId: 'c-4', purpose: 'default' },
];
