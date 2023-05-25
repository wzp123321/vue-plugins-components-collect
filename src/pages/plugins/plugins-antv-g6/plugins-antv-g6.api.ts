// 数据异常背景色
export const EAD_OVER_BG_COLOR = 'rgba(245, 34, 45, 1)';
// 数据颜色
export const EAD_COUNT_COLOR = 'rgba(0, 0, 0, 0.85)';
// 数据与名称间距(左侧)
export const EAD_NAME_COUNT_GAP = 8;
// 数据与单位间距(右侧)
export const EAD_COUNT_UNIT_GAP = 4;

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

export const enum EAD_HOME_ENodeType {
  主节点,
  收入,
  成本,
}

export const enum EAD_HOME_EPopupType {
  默认,
  主节点,
  节能项,
  实缴,
}

export interface IResBrainMapNode {
  amount: string;
  deductFlag: boolean;
  energyCode?: string;
  extendTypeData: { code: string; name: string; order: number; unit: string; value: string; color: string }[];
  nodeId: string;
  nodeName: string;
  nodeType: string;
  popupType: string;
  remark: string;
  operateName: string;
  unit: string;
  children: IResBrainMapNode[];
}

export interface EAD_HOME_IBrainMapNode {
  readonly id: string;
  readonly name: string;
  readonly value: string;
  readonly unit: string;
  readonly operateName: string;
  readonly position?: 'right' | 'left';
  readonly isDeduction: boolean;
  readonly extensions: EAD_HOME_INodeExtensionItem[];
  readonly energyCode?: string;
  readonly popup: EAD_HOME_EPopupType;
  readonly children: EAD_HOME_IBrainMapNode[];
}

export interface EAD_HOME_INodeExtensionItem {
  readonly code: string;
  readonly name: string;
  order?: number;
  readonly value?: string;
  readonly unit?: string;
  readonly color?: string;
  visible?: boolean;
}

export const mockData: any = {
  nodeId: '1',
  nodeName: '毛利额',
  nodeType: '0',
  deductFlag: false,
  popupType: '1',
  amount: '416.07',
  unit: '万元',
  operateName: null,
  nodeSource: '0',
  formula: null,
  extendTypeData: [],
  masterValue: '4160734.46',
  incomeValue: '1226426692.9',
  children: [
    {
      nodeId: '2',
      nodeName: '运营成本',
      nodeType: '2',
      deductFlag: false,
      popupType: '0',
      amount: '1806',
      unit: '元',
      operateName: null,
      nodeSource: '1',
      formula: null,
      extendTypeData: [],
      children: [
        {
          nodeId: '4',
          nodeName: '人工成本',
          nodeType: '2',
          deductFlag: false,
          popupType: '0',
          amount: '1806',
          unit: '元',
          operateName: null,
          nodeSource: '1',
          formula: null,
          extendTypeData: [],
          children: [
            {
              nodeId: '10',
              nodeName: '运维人工成本',
              nodeType: '2',
              deductFlag: false,
              popupType: '0',
              amount: '1806',
              unit: '元',
              operateName: null,
              nodeSource: '1',
              formula: null,
              extendTypeData: [],
              children: null,
            },
          ],
        },
      ],
    },
    {
      nodeId: '3',
      nodeName: '直接成本',
      nodeType: '2',
      deductFlag: false,
      popupType: '0',
      amount: '12.22',
      unit: '亿元',
      operateName: null,
      nodeSource: '1',
      formula: null,
      extendTypeData: [],
      children: [
        {
          nodeId: '6',
          nodeName: '第三方合作伙伴成本',
          nodeType: '2',
          deductFlag: false,
          popupType: '0',
          amount: '12.22',
          unit: '亿元',
          operateName: '',
          nodeSource: '1',
          formula: null,
          extendTypeData: [],
          children: [],
        },
        {
          nodeId: '7',
          nodeName: '施工外包成本',
          nodeType: '2',
          deductFlag: false,
          popupType: '0',
          amount: '2496',
          unit: '元',

          operateName: null,
          nodeSource: '1',
          formula: null,
          extendTypeData: [],
          children: null,
        },
      ],
    },
    {
      nodeId: '29',
      nodeName: '能源费成本-对公支付部分',
      nodeType: '1',
      deductFlag: true,
      popupType: '0',
      amount: '4.53',
      unit: '万元',

      operateName: null,
      nodeSource: '1',
      formula: null,
      extendTypeData: [],
      children: null,
    },
    {
      nodeId: '30',
      nodeName: '归属测试收益',
      nodeType: '1',
      deductFlag: false,
      popupType: '0',
      amount: '420.01',
      unit: '万元',

      operateName: null,
      nodeSource: '0',
      formula: null,
      extendTypeData: [],
      children: null,
    },
    {
      nodeId: '31',
      nodeName: '实缴费用',
      nodeType: '1',
      deductFlag: true,
      popupType: '3',
      amount: '3689',
      unit: '元',

      operateName: null,
      nodeSource: '0',
      formula: null,
      extendTypeData: [],
      children: [
        {
          nodeId: null,
          nodeName: '电',
          nodeType: null,
          deductFlag: null,
          popupType: '0',
          amount: '3689',
          unit: '元',

          operateName: null,
          nodeSource: null,
          formula: null,
          extendTypeData: null,
          energyCode: '01000',
          children: null,
        },
      ],
    },
    {
      nodeId: '32',
      nodeName: '节能收益',
      nodeType: '1',
      deductFlag: false,
      popupType: '2',
      amount: '6666',
      unit: '元',

      operateName: null,
      nodeSource: '0',
      formula: null,
      extendTypeData: [],
      children: null,
    },
    {
      nodeId: '33',
      nodeName: '收入',
      nodeType: '1',
      deductFlag: false,
      popupType: '0',
      amount: '12.22',
      unit: '亿元',

      operateName: null,
      nodeSource: '0',
      formula: null,
      extendTypeData: [],
      children: [
        {
          nodeId: '34',
          nodeName: '收入费用一',
          nodeType: '1',
          deductFlag: false,
          popupType: '0',
          amount: '12.22',
          unit: '亿元',

          operateName: null,
          nodeSource: '0',
          formula: '【6】+【7】+600',
          extendTypeData: [],
          children: null,
        },
        {
          nodeId: '35',
          nodeName: '收入费用二',
          nodeType: '1',
          deductFlag: false,
          popupType: '0',
          amount: '4189',
          unit: '元',

          operateName: null,
          nodeSource: '0',
          formula: '【31】+500',
          extendTypeData: [],
          children: null,
        },
      ],
    },
  ],
};
