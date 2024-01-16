/**
 * 经营分析表头数据，弹框tree树显示结构
 * @param name 表头名
 * @param code 切换tab的查询表格传参
 * @param show 是否显示技术节能展开操作
 */
export interface TabObj {
  name: string;
  code?: string;
  show?: boolean;
}

/**
 * 弹框左右组件切换背景图
 * @param left 左边背景图
 * @param right 右侧背景图
 */
export interface ComponentsObj {
  left: string;
  right: string;
}

/**
 * 节能总收益表头数据
 * @param name 表头名
 */
export interface TableNameObj {
  name: string;
}

/**
 * 弹框图表数据
 * @param date 日期
 * @param type 图名字
 * @param index 索引
 * @param value 柱状图数据
 * @param rate 直线数据
 */
export interface TableNameObj {
  date: string;
  type: string;
  index: number;
  value: null | number;
  rate: null | number;
}
