// vxe 渲染管线桥：单元格显示渲染器在重绘时读取条件格式开关与列统计。
// vxe 的 renderCell 重绘时机由网格内部控制，无法直接参与 Vue 响应式依赖收集，
// 故用模块级可变对象做单向数据桥：core 在统计重算时写入，渲染器重绘时读取。
export interface ColStat {
  min: number;
  max: number;
}

export const RT: { colStat: Record<string, ColStat>; conditionalOn: boolean } = {
  colStat: {},
  conditionalOn: false,
};
