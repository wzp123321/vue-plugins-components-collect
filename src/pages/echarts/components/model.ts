import {
  NightingaleCharts,
  AreaChart,
  BreakPointChart,
  SubsectionChart,
  WaterBallChart,
  MultistageChart,
  RankChart,
  PmChart,
  EchartsGraphic,
  StackBar,
} from './index';

export const roseMinMaxRate = 1 / 20;

/**
 * 堆叠图子节点信息
 */
export interface NightingaleChartsChildrenBarInfo {
  treeId: number | null;
  treeName: string;
  valueSum: number | null;
  percentSum: number | null;
  valueList: (number | null)[];
  percentList: (number | null)[];
  dataIndex?: number;
}

/**
 * 堆叠图
 */
export interface NightingaleChartsData {
  unit: string;
  energyCodeName: string;
  treeEnergy: number | null;
  balanceRate: number | null;
  xaxisTimes: number[];
  childrenBarInfo: NightingaleChartsChildrenBarInfo[];
}

export const nightingaleChartsDataList: NightingaleChartsData = {
  unit: 'kWh',
  energyCodeName: '电',
  treeEnergy: 657559.07,
  balanceRate: 28.65,
  xaxisTimes: [
    1741708800000, 1741712400000, 1741716000000, 1741719600000, 1741723200000, 1741726800000, 1741730400000,
    1741734000000, 1741737600000, 1741741200000, 1741744800000, 1741748400000, 1741752000000, 1741755600000,
    1741759200000,
  ],
  childrenBarInfo: [
    {
      treeId: 1859027518455829,
      treeName: '主院区',
      valueSum: 8881.61,
      percentSum: 1.35,
      valueList: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1517.22, 0.0, 0.0, 7364.39],
      percentList: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 4.72, 0.0, 0.0, 14.34],
    },
    {
      treeId: 1859027518533645,
      treeName: '滑翔院区',
      valueSum: 131511.82,
      percentSum: 20.0,
      valueList: [
        8883.14, 9971.49, 6552.36, 9943.5, 8392.84, 8569.8, 9264.7, 10270.97, 9339.72, 9099.82, 8776.77, 6426.43,
        7726.77, 8025.85, 10267.66,
      ],
      percentList: [20.0, 20.0, 20.0, 20.0, 20.0, 20.0, 20.0, 20.0, 20.0, 20.0, 20.0, 20.0, 20.0, 20.0, 20.0],
    },
    {
      treeId: 1859027518578717,
      treeName: '沈北院区',
      valueSum: 131511.82,
      percentSum: 20.0,
      valueList: [
        8883.14, 9971.49, 6552.36, 9943.5, 8392.84, 8569.8, 9264.7, 10270.97, 9339.72, 9099.82, 8776.77, 6426.43,
        7726.77, 8025.85, 10267.66,
      ],
      percentList: [20.0, 20.0, 20.0, 20.0, 20.0, 20.0, 20.0, 20.0, 20.0, 20.0, 20.0, 20.0, 20.0, 20.0, 20.0],
    },
    {
      treeId: 1859027518582797,
      treeName: '本溪院区',
      valueSum: 93.87,
      percentSum: 15.0,
      valueList: [
        6662.35, 7478.62, 4914.27, 7457.63, 6294.63, 6427.35, 6948.53, 7703.23, 7004.79, 6824.86, 6582.58, 4819.82,
        5795.08, 6019.39, 7700.74,
      ],
      percentList: [15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0],
    },
    {
      treeId: 1859027518636053,
      treeName: '测试院区*)(%^$#*&())$::',
      valueSum: 0.0,
      percentSum: 0.0,
      valueList: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
      percentList: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    },
    {
      treeId: 1859027518582813,
      treeName: '东湖院区',
      valueSum: 98633.87,
      percentSum: 15.0,
      valueList: [
        6662.35, 7478.62, 4914.27, 7457.63, 6294.63, 6427.35, 6948.53, 7703.23, 7004.79, 6824.86, 6582.58, 4819.82,
        5795.08, 6019.39, 7700.74,
      ],
      percentList: [15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0, 15.0],
    },
    {
      treeId: 1859027518803997,
      treeName: '区域院区10000',
      valueSum: 0.0,
      percentSum: 0.0,
      valueList: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
      percentList: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    },
    {
      treeId: 1963502581948429,
      treeName: 'm2',
      valueSum: null,
      percentSum: null,
      valueList: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      percentList: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    },
  ],
};

export const customComponents: { description: string; component: any }[] = [
  {
    description: '南丁格尔玫瑰图',
    component: NightingaleCharts,
  },
  {
    description: '堆叠图',
    component: StackBar,
  },
  {
    description: '折线区域图',
    component: AreaChart,
  },
  {
    description: '折线断点图',
    component: BreakPointChart,
  },
  {
    description: '折线打点图',
    component: SubsectionChart,
  },
  {
    description: '水球',
    component: WaterBallChart,
  },
  {
    description: '柱状图悬浮展示y轴文本',
    component: RankChart,
  },
  {
    description: '柱状堆叠图',
    component: MultistageChart,
  },
  {
    description: '柱状横向图',
    component: PmChart,
  },
  {
    description: '自定义水印',
    component: EchartsGraphic,
  },
];
