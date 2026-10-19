// vxe 渲染管线桥：单元格显示渲染器在重绘时读取条件格式开关与列统计。
// vxe 的 renderCell 重绘时机由网格内部控制，无法直接参与 Vue 响应式依赖收集，
// 故用模块级可变对象做单向数据桥：core 在统计重算时写入，渲染器重绘时读取。
//
// 本文件职责：导出模块级单例 RT，作为"显示渲染器"与"核心统计/条件格式状态"之间的
// 单向数据桥（bridge）。因为 vxe 的 renderCell 不受 Vue 响应式追踪，渲染器无法用 ref 直接拿到
// 最新统计，只能用这个可变对象在每次重绘时"读最新值"。
//
// 协作模块：
//   - useGridCore：在统计/条件格式重算后写入 RT.colStat 与 RT.conditionalOn；
//   - ./display.ts：renderCellDisplay 读取 RT 决定是否画数据条。
export interface ColStat {
  min: number;
  max: number;
}

export const RT: {
  colStat: Record<string, ColStat>;
  conditionalOn: boolean;
  /** 当前生效的列筛选（core.columnFilters 的引用），供筛选面板回显——面板在 vxe 弹层里，拿不到 core */
  filters: Record<string, string[]>;
} = {
  colStat: {},
  conditionalOn: false,
  filters: {},
};
