// 接口地址
export enum Ec_EPath {
  查询能耗纵览总览数据 = '/app/energyOverview/queryTotalNodeData',
  查询纵览子节点列表 = '/app/energyOverview/querySonTreeList',
  根据子节点id查询子节点信息 = '/app/energyOverview/queryNodeData',
}

// 默认背景色
export const EL_DEFAULT_BG_COLOR = '#aaaaaa';
// 最大高度
export const EL_SCAN_MAX_HEIGHT = 78;
// 提示语
export const Ec_EEmptyTitle = '暂无内容';
// 加载失败提示语
export const Ec_LoadErrorTitle = {
  title: '加载失败',
  subTitle: '请刷新页面重试',
};
// 初始值
export const initialRes = {
  nodeItem: {
    itemId: '',
    itemName: '',
    energyValue: null,
    energyUnit: '',
    percent: '',
    percentValue: null,
    costValue: null,
    costUnit: '',
    lastMonthPercent: null,
    lastYearPercent: null,
    lastMonthCostPercent: null,
    lastYearCostPercent: null,
    strCostValue: '',
    parentItemName: '',
    hasChildren: false,
    children: [],
  },
  childrenItem: [],
  childrenItemHead: [],
};
