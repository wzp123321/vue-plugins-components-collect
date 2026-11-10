// 院区选择：值契约 + 选择弹框的数据源（mock）
// ============================================================================
// 本文件职责：
//   1. 定义院区单元格里存的结构化对象 RegionValue（name 展示 / id、code 存数据）；
//   2. 提供「分组 → 院区」两级树，供选择弹框做单选；
//   3. 提供摊平列表与按名反查，供导入 Excel 时把院区名称还原成结构化对象。
//
// 单元格里的存法（重要）：Univer 的 ICellData 是
//   { v: 院区名称, custom: { name, id, code } }
// `v` 是字符串，直接走 Univer 原生文本渲染（字体、暗色反色、筛选、排序、复制粘贴
// 全部自动兼容）；`custom` 是官方 ICellData 字段，mergeCellData 会原样保留并深拷贝，
// 用来存 id / code，避免显示名和 id 对不上。
// 不能把对象塞进 `v`：对象值会被判成 FORCE_STRING，渲染出来是 "[object Object]"；
// 也不需要自定义 canvas 渲染器。读回时用 FRange.getCellDatas() 取原始 ICellData。
//
// 真实项目把 REGION_TREE 换成接口返回即可，其余逻辑不用动。
// ============================================================================

/** 院区单元格值：name 用于展示，id / code 随数据一起存 */
export interface RegionValue {
  name: string;
  id: string;
  code: string;
}

/** 树节点：带 children 的是分组（不可选），叶子才是可选院区 */
export interface RegionNode {
  id: string;
  code: string;
  name: string;
  children?: RegionNode[];
}

/** 院区树：集团 → 片区 → 院区（两层分组 + 叶子） */
export const REGION_TREE: RegionNode[] = [
  {
    id: 'grp-east', code: 'GRP-E', name: '华东片区',
    children: [
      { id: 'r-sh-01', code: 'SH-001', name: '上海总院' },
      { id: 'r-sh-02', code: 'SH-002', name: '上海浦东院区' },
      { id: 'r-sh-03', code: 'SH-003', name: '上海虹桥院区' },
      { id: 'r-hz-01', code: 'HZ-001', name: '杭州院区' },
      { id: 'r-nj-01', code: 'NJ-001', name: '南京院区' },
      { id: 'r-sz-01', code: 'SZ-001', name: '苏州院区' },
    ],
  },
  {
    id: 'grp-north', code: 'GRP-N', name: '华北片区',
    children: [
      { id: 'r-bj-01', code: 'BJ-001', name: '北京总院' },
      { id: 'r-bj-02', code: 'BJ-002', name: '北京朝阳院区' },
      { id: 'r-tj-01', code: 'TJ-001', name: '天津院区' },
      { id: 'r-qd-01', code: 'QD-001', name: '青岛院区' },
    ],
  },
  {
    id: 'grp-south', code: 'GRP-S', name: '华南片区',
    children: [
      { id: 'r-gz-01', code: 'GZ-001', name: '广州总院' },
      { id: 'r-sz-02', code: 'SZ-002', name: '深圳院区' },
      { id: 'r-dg-01', code: 'DG-001', name: '东莞院区' },
    ],
  },
  {
    id: 'grp-west', code: 'GRP-W', name: '西部片区',
    children: [
      { id: 'r-cd-01', code: 'CD-001', name: '成都院区' },
      { id: 'r-cq-01', code: 'CQ-001', name: '重庆院区' },
      { id: 'r-xa-01', code: 'XA-001', name: '西安院区' },
    ],
  },
];

/** 摊平所有可选院区（叶子节点）：导入反查、弹框校验都用它 */
export const REGION_LEAVES: RegionValue[] = (() => {
  const out: RegionValue[] = [];
  const walk = (nodes: RegionNode[]) => {
    nodes.forEach((n) => {
      if (n.children?.length) walk(n.children);
      else out.push({ name: n.name, id: n.id, code: n.code });
    });
  };
  walk(REGION_TREE);
  return out;
})();

/** 按名称精确反查（导入 Excel 用；同名取第一个，查不到返回 null 由调用方跳过） */
export const findRegionByName = (name: unknown): RegionValue | null => {
  const key = String(name ?? '').trim();
  if (!key) return null;
  return REGION_LEAVES.find((r) => r.name === key) ?? null;
};

/** 判定一个值是不是院区对象（渲染器 / 校验 / 导出共用） */
export const isRegionValue = (v: unknown): v is RegionValue =>
  !!v
  && typeof v === 'object'
  && !Array.isArray(v)
  && typeof (v as RegionValue).name === 'string'
  && ((v as RegionValue).id !== undefined || (v as RegionValue).code !== undefined);
