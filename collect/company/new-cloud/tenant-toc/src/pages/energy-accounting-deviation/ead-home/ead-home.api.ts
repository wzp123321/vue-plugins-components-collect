// 负数--背景色
export const EAD_NEGATIVE_BG_COLOR = 'rgb(82, 196, 26)';
// 正数--背景色
export const EAD_POSITIVE_BG_COLOR = 'rgba(245, 34, 45, 1)';
// 节能量颜色黑色
export const EAD_COUNT_COLOR_BLACK = 'rgba(0, 0, 0, 0.85)';
// 节能量颜色白色
export const EAD_NODE_DEFAULT_COLOR = '#128BED';
// 节能量颜色白色
export const EAD_COUNT_COLOR_WHITE = 'rgb(255, 255, 255)';
// 连线颜色
export const EAD_NODE_LINE_COLOR = '#C7C7C7';
// 展开图标颜色
export const EAD_EXPAND_BUTTON_COLOR = '#979797';
// 数据与名称间距(左侧)
export const EAD_NAME_COUNT_GAP = 8;
// 数据与单位间距(右侧)
export const EAD_COUNT_UNIT_GAP = 4;
// 带边框节点内边距
export const EAD_NODE_PADDING = 16;
// 需要比较正负的节点名称
export const EAD_COMPARE_NAME = '节能预核算偏差';
// 内圈颜色
export const EAD_COLORS_INNER = [
  '#D4BD84',
  '#B4C217',
  '#F87EFF',
  '#C26517',
  '#407675',
  '#019898',
  '#8D72A6',
  '#8FB78E',
  '#8284FF',
  '#2FD3DC',
];
// 外圈颜色
export const EAD_COLORS_OUTER = [
  '#00A5B2',
  '#FE4B4E',
  '#443AFF',
  '#F9AD15',
  '#42B20D',
  '#A83BFF',
  '#85A4FF',
  '#FFCB20',
  '#9FFF3B',
  '#106DD9',
];
// 节点位置
export enum EadENodePositionType {
  中间节点 = '0',
  左半边 = '1',
  右半边 = '2',
}
// 脑图数据
export interface EadIBrainMapRes {
  /**
   * 时间字符串
   */
  timeStr: string;
  /**
   * 节点树数据
   */
  treeNodeDatas: EadItreeNodeDatas;
}
// 脑图节点数据
export interface EadItreeNodeDatas {
  /**
   * 节点id
   */
  nodeId: string;
  /**
   * 节点名称
   */
  nodeName: string;
  /**
   * 节点类型(0中间节点、1左半边、2右半边)
   */
  nodeType: EadENodePositionType;
  /**
   * 是否扣除
   */
  deductFlag: boolean;
  /**
   * 金额
   */
  amount: number;
  /**
   * 金额单位
   */
  unit: string;
  /**
   * 子节点
   */
  children: EadItreeNodeDatas[];
}
// 处理后的脑图数据
export interface EadIBrainMapNode extends Omit<EadItreeNodeDatas, 'children'> {
  readonly position: 'right' | 'left' | undefined;
  deductFlag: boolean;
  children: EadIBrainMapNode[];
}
// 连线的状态类型
export enum EadEBrainEdgeState {
  流动效果 = 'flow',
}
