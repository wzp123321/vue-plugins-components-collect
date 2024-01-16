import { Common_ILabelValue } from '@/services/common/common-api';

const characters: string = '';

const normalReg = String.raw`\`\\;\'\"<>`;
const env = process.env.NODE_ENV || 'production';

// 特殊字符
export const specialCharacters = ['`', ';', "'", '"', '<', '>', ' ', '-'];

// 分析对象-tree-type
export const treeTypeList = [
  { value: 1, label: '区域' },
  { value: 2, label: '业态' },
];

// 带科室的树类型列表
export const treeTypeWithDepartList: Common_ILabelValue<number>[] = [
  { value: 1, label: '区域' },
  { value: 2, label: '业态' },
  { value: 4, label: '科室' },
];

/**
 * 时间范围--快捷选时
 */
export const dateScopeList = [
  { value: 0, label: '今日' },
  { value: 1, label: '本周' },
  { value: 2, label: '本月' },
];

export const dateScopeListAll = [
  { value: 0, label: '日' },
  { value: 1, label: '周' },
  { value: 2, label: '月' },
  { value: 3, label: '年' },
  { value: 4, label: '任意时间段' },
];
export const dateScopeListMonthOrYear = [
  { value: '1', label: '按月' },
  { value: '2', label: '按年' },
];

/**
 * 定额类型
 */
export const quotaTypeList = [
  {
    label: '月',
    value: 1,
  },
  {
    label: '年',
    value: 2,
  },
];

/**
 * 排名类型
 */
export const rankTypeList = [
  { value: 0, label: '本日' },
  { value: 1, label: '本周' },
  { value: 2, label: '本月' },
  { value: 3, label: '本年' },
];

// 跳转节能考核地址
export const energyConervationManageUrl = '/web/energyConservationManage';

// 分页器每页数量
export const pageSizes = [10, 20, 30, 40, 50];

// 定额配置时间颗粒字典类型
export const loadForecastingTimeUnitArr = [
  { label: '日', value: '1d' },
  { label: '月', value: '1M' },
];

// 无配置图片
export const noConfigImg = require('@/assets/img/common/common-config-unset.svg');

// 切换升序降序icons
export const switchSortIcons = [
  {
    code: 1,
    imgs: [
      require('@/assets/img/common/common-down-select.svg'),
      require('@/assets/img/common/common-down-no-select-light.svg'),
      require('@/assets/img/common/common-down-no-select-dark.svg'),
    ],
  },
  {
    code: 2,
    imgs: [
      require('@/assets/img/common/common-asce-select.svg'),
      require('@/assets/img/common/common-asce-no-select-light.svg'),
      require('@/assets/img/common/common-asce-no-select-dark.svg'),
    ],
  },
];

// 切换表格柱状图icons
export const switchTableBarChartIcons = [
  {
    code: 1,
    imgs: [
      require('@/assets/img/common/common-switch-table-select.svg'),
      require('@/assets/img/common/common-switch-table-no-select.svg'),
      require('@/assets/img/common/common-switch-table-no-select-dark.svg'),
    ],
  },
  {
    code: 2,
    imgs: [
      require('@/assets/img/common/common-histogram.svg'),
      require('@/assets/img/common/common-histogram-select.svg'),
      require('@/assets/img/common/common-histogram-select-dark.svg'),
    ],
  },
];
// 切换表格折线图icons
export const switchTableLineChartIcons = [
  {
    code: 1,
    imgs: [
      require('@/assets/img/common/common-switch-table-select.svg'),
      require('@/assets/img/common/common-switch-table-no-select.svg'),
      require('@/assets/img/common/common-switch-table-no-select-dark.svg'),
    ],
  },
  {
    code: 2,
    imgs: [
      require('@/assets/img/common/common-switch-line-select.svg'),
      require('@/assets/img/common/common-switch-line-no-select.svg'),
      require('@/assets/img/common/common-switch-line-no-select-dark.svg'),
    ],
  },
];

// 切换折线图表格icons
export const switchLineChartTableIcons = [
  {
    code: 1,
    imgs: [
      require('@/assets/img/common/common-switch-line-select.svg'),
      require('@/assets/img/common/common-switch-line-no-select.svg'),
      require('@/assets/img/common/common-switch-line-no-select-dark.svg'),
    ],
  },
  {
    code: 2,
    imgs: [
      require('@/assets/img/common/common-switch-table-select.svg'),
      require('@/assets/img/common/common-switch-table-no-select.svg'),
      require('@/assets/img/common/common-switch-table-no-select-dark.svg'),
    ],
  },
];
// 切换表格散点图
export const switchTableScatterChartIcons = [
  {
    code: 1,
    imgs: [
      require('@/assets/img/common/common-scatter-select.svg'),
      require('@/assets/img/common/common-scatter-no-select.svg'),
      require('@/assets/img/common/common-scatter-no-select-dark.svg'),
    ],
  },
  {
    code: 2,
    imgs: [
      require('@/assets/img/common/common-switch-table-select.svg'),
      require('@/assets/img/common/common-switch-table-no-select.svg'),
      require('@/assets/img/common/common-switch-table-no-select-dark.svg'),
    ],
  },
];
// publicPath
export const PUBLIC_PATH = env === 'production' ? '/energy/ems' : '/';

// 后台前缀地址
export const MANAGE_PUBLIC_PATH = env === 'production' ? '/energy/ems/ems-admin' : '/';

// sessionStorage key值
export const sessionStorageKey = 'iot_ems_session';

/**
 * 能源异常时长选项
 * 在处理的时候需要判断当前时长是否大于999
 */
export const anomalyHideDays = [
  {
    label: '7天',
    value: 7,
  },
  {
    label: '30天',
    value: 30,
  },
  {
    label: '永久',
    value: 99999,
  },
];

/**
 * iframe id
 */
export const IFRAME_ID = 'ems_iframe';

export const MENU_PARAMS = 1;

// 树节点管理-tree-type
export const treeTypeListData = [
  { value: 1, label: '区域' },
  { value: 2, label: '业态' },
  { value: 3, label: '支路' },
  { value: 4, label: '环境' },
];

// 表单输入框正则
export const formInputRule = {
  NORMAL_INPUT: new RegExp(String.raw`[${normalReg}${characters}]`, 'g'), // 普通输入框
  NUMBER_INPUT: new RegExp(/[^\d.]/, 'g'), // 数字
  POSITOIVE_NUMBER_INPUT: new RegExp(/^(0+)|[^\d]+/, 'g'), // 正整数
};

/**
 * 菜单icon
 */
export const getMenuIconByOrderNum = (orderyNum: number) => {
  let icons = '';
  switch (orderyNum) {
    case 1:
      icons = 'icon-nenghaomenhu';
      break;
    case 2:
      icons = 'icon-a-BasicAnalysis';
      break;
    case 3:
      icons = 'icon-a-EnergyTrusteeship';
      break;
    case 4:
      icons = 'icon-a-expert';
      break;
    case 5:
      icons = 'icon-a-NeedManage';
      break;
    case 6:
      icons = 'icon-a-EnergyAuditFolder';
      break;
    case 7:
      icons = 'icon-a-alarm';
      break;
    case 8:
      icons = 'icon-a-SystemManage';
      break;
    case 9:
      icons = 'icon-a-monitor_gis';
      break;
    default:
      icons = 'icon-nenghaomenhu';
      break;
  }
  return icons;
};

export const FORBIDDEN_CODE = 401;
