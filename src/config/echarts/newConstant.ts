// 卡片背景颜色组
export const pieColors = [
  'rgba(14, 109, 250, 1)',
  'rgba(19, 194, 194, 1)',
  'rgba(250, 173, 20, 1)',
  'rgba(33, 181, 52, 1)',
  'rgba(47, 84, 235, 1)',
  'rgba(219, 26, 219, 1)',
  'rgba(250, 130, 5, 1)',
];
// 卡片渐变背景颜色组
export const cardLinearBackgroundColors = [
  'linear-gradient(90deg, rgba(14, 109, 250, 0.4) 0%, rgba(153, 194, 255, 0.2) 76.17%, rgba(255, 255, 255, 0) 100%)',
  'linear-gradient(90deg, rgba(19, 194, 194, 0.4) 0%, rgba(178, 255, 255, 0.2) 76.17%, rgba(255, 255, 255, 0) 100%)',
  'linear-gradient(90deg, rgba(250, 173, 20, 0.4) 0%, rgba(255, 211, 123, 0.2) 76.17%, rgba(255, 255, 255, 0) 100%)',
  'linear-gradient(90deg, rgba(33, 181, 52, 0.4) 0%, rgba(92, 224, 109, 0.2) 76.17%, rgba(255, 255, 255, 0) 100%)',
  'linear-gradient(90deg, rgba(47, 84, 235, 0.4) 0%, rgba(120, 146, 255, 0.2) 76.17%, rgba(255, 255, 255, 0) 100%)',
  'linear-gradient(90deg, rgba(219, 26, 219, 0.4) 0%, rgba(254, 91, 254, 0.2) 76.17%, rgba(255, 255, 255, 0) 100%)',
  'linear-gradient(90deg, rgba(249, 134, 30, 0.4) 0%, rgba(255, 179, 111, 0.2) 76.17%, rgba(255, 255, 255, 0) 100%)',
];

// 变量
export const newEChartsConstant = {
  // 饼状图色卡顺序(10个一循环)
  CHARTS_PIE_MAIN_COLOR: [
    'rgba(14, 109, 250, 1)',
    'rgba(19, 194, 194, 1)',
    'rgba(250, 173, 20, 1)',
    'rgba(33, 181, 52, 1)',
    'rgba(47, 84, 235, 1)',
    'rgba(219, 26, 219, 1)',
    'rgba(250, 130, 5, 1)',
    '#00A5B2',
    '#EC50D2',
    '#FFCB20',
  ],
  // 曲线图、柱状图色卡顺序(10个一循环)
  CHARTS_LINE_BAR_MAIN_COLOR: [
    '#3681FF',
    '#FF9120',
    '#FFCB20',
    '#00B261',
    '#FE4B4E',
    '#443AFF',
    '#A83BFF',
    '#00A5B2',
    '#D91026',
    '#EC50D2',
  ],
  // 多轴图色卡
  CHARTS_MULTIPLE_MAIN_COLOR: [
    '#1F8FFB',
    '#3681FF',
    '#FF9120',
    '#FFCB20',
    '#00B261',
    '#FE4B4E',
    '#443AFF',
    '#A83BFF',
    '#00A5B2',
    '#D91026',
    '#EC50D2',
  ],
  // 环状图色卡顺序(10个一循环)-渐变色
  CHARTS_DOUGHNUT_MAIN_COLOR: [
    ['#01EAD2', '#00A6EB'],
    ['#F8CD31', '#FD9200'],
    ['#E875AF', '#F8428B'],
    ['#7F67F9', '#7F67F9'],
    ['#EB7CFE', '#C500E7'],
    ['#6CA3FF', '#3681FF'],
    ['#FF8587', '#FE4B4E'],
    ['#3DDA92', '#3DDA92'],
    ['#C378FF', '#A83BFF'],
    ['#FF6262', '#B90000'],
  ],
  // 通用悬浮框背景色
  CHARTS_TOOLTIP_BG_COLOR: 'rgba(24, 144, 255, 0.8)',
  // 悬浮框字体颜色
  CHARTS_TOOLTIP_TEXT_COLOR: 'rgba(255, 255, 255, 1)',
  // 轴文本颜色
  CHARTS_AXIS_TEXT_COLOR: 'rgba(0, 0, 0, 0.65)',
  // 轴文本颜色-浅色
  CHARTS_AXIS_TEXT_SHADOW_COLOR: 'rgba(0, 0, 0, 0.45)',
  // 轴线颜色
  CHARTS_AXIS_LINE_COLOR: '#CDD0D6',
  // 分割线颜色
  CHARTS_SPLIT_LINE_COLOR: 'rgba(0, 0, 0, 0.15)',
  // 环形图中间文本颜色
  GAUGE_MIDDLE_TEXT_COLOR: '#000',
  // 饼状图title颜色
  PIE_TITLE_TEXT_COLOR: '#000',
  // 文本字体大小
  CHARTS_FONT_SIZE_14: 14,
  // legend图标---虚线
  ECHARTS_DASHED_THREE_LEGEND_ICON:
    'path://M304.43 532.76H221.4c-11.47 0-20.76-9.3-20.76-20.76s9.29-20.76 20.76-20.76h83.03c11.47 0 20.76 9.3 20.76 20.76s-9.29 20.76-20.76 20.76zM581.19 532.76H442.81c-11.47 0-20.76-9.3-20.76-20.76s9.29-20.76 20.76-20.76h138.38c11.47 0 20.76 9.3 20.76 20.76s-9.3 20.76-20.76 20.76zM802.59 532.76h-83.03c-11.47 0-20.76-9.3-20.76-20.76s9.29-20.76 20.76-20.76h83.03c11.47 0 20.76 9.3 20.76 20.76s-9.29 20.76-20.76 20.76z',
  // legend图标---实线
  ECHARTS_SOLID_LEGEND_SVG: 'path://M0,0 L20,0 L20,2 L0,2 Z',
  // legend分页icon颜色 高亮
  CHARTS_LEGEND_ICON_ACTIVE_COLOR: 'rgba(24, 144, 255, 1)',
  // legend分页icon颜色
  CHARTS_LEGEND_ICON_COLOR: 'rgba(24, 144, 255, 1)',
  // tooltip padding
  CHARTS_TOOLTIP_PADDING: [8, 12],
  // tooltip boxshadow color
  CHARTS_TOOLTIP_BOX_SHADOW_COLOR: 'rgba(0, 0, 0, 0.15)',
  // tooltip boxshadow offsetx
  CHARTS_TOOLTIP_BOX_SHADOW_OFFSETX: '4px',
  // tooltip boxshadow offsety
  CHARTS_TOOLTIP_BOX_SHADOW_OFFSETY: '8px',
  // dataZoom
  CHART_DATA_ZOOM: (labelFormatter: (value: string) => string) => [
    {
      type: 'slider',
      xAxisIndex: [0],
      start: 0,
      end: 100,
      bottom: 12,
      right: 40,
      height: 24,
      handleSize: '100%',
      handleStyle: {
        color: '#1890FF',
      },
      fillerColor: 'rgba(24, 144, 255, 0.1)',
      backgroundColor: 'rgba(250, 250, 250, 1)',
      borderColor: 'rgba(0, 0, 0, 0.15)',
      showDataShadow: false,
      labelFormatter,
    },
    {
      type: 'inside',
      xAxisIndex: [0],
      start: 0,
      end: 100,
      height: 24,
      bottom: 12,
      right: 40,
      handleSize: '100%',
      handleStyle: {
        color: '#1890FF',
      },
      fillerColor: 'rgba(24, 144, 255, 0.1)',
      backgroundColor: 'rgba(250, 250, 250, 1)',
      borderColor: 'rgba(0, 0, 0, 0.15)',
      showDataShadow: false,
    },
  ],
};
