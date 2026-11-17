// vxe 渲染管线桥：筛选面板在 vxe 弹层内，拿不到页面装配的 core。
// 因为弹层不受 Vue 组件树管辖，用模块级可变对象做单向数据桥：core 把 columnFilters
// 的引用写进来，面板重绘时读最新值（不再需要条件格式/列统计那一侧，已随功能删除）。
//
// 协作模块：
//   - useGridCore：把 columnFilters 挂到 RT.filters；
//   - ./FilterPanel.vue：读取 RT.filters 回显该列已生效的筛选值。
export const RT: {
  /** 当前生效的列筛选（core.columnFilters 的引用），供筛选面板回显——面板在 vxe 弹层里，拿不到 core */
  filters: Record<string, string[]>;
} = {
  filters: {},
};
