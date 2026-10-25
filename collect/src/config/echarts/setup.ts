/**
 * ECharts 统一按需入口
 * --------------------------------------------------------------------------
 * 业务侧统一从此处取 init / format / graphic / 类型，避免各文件重复写 'echarts' 全量导入。
 *
 * 类型口径（关键，避免 echarts 5.6 的实例类型名义不互通问题）：
 * - init / EChartsType / EChartsOption 一律取自主包（main），保证 init 返回值与 ref 标注同源；
 * - 按需注册用 echarts/core 的 use()，以接受 'echarts/charts' 等子路径导出的 core 组件类型
 *   （主包的 use() 签名不接受子路径组件类型，故注册与类型取值分两套来源）。
 *
 * 新增图表类型或组件时，只需在此扩充 use([...]) 列表。
 */
import * as echarts from 'echarts';
import * as echartsCore from 'echarts/core';
import type * as EChartsMain from 'echarts';

import {
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  EffectScatterChart,
  MapChart,
  GaugeChart,
  PictorialBarChart,
  RadarChart,
  FunnelChart,
  HeatmapChart,
  GraphChart,
  SankeyChart,
} from 'echarts/charts';

import {
  GridComponent,
  TooltipComponent,
  RadarComponent,
  LegendComponent,
  DataZoomComponent,
  VisualMapComponent,
  MarkAreaComponent,
  MarkPointComponent,
  GraphicComponent,
  GeoComponent,
  TitleComponent,
  AxisPointerComponent,
  ToolboxComponent,
  DatasetComponent,
  CalendarComponent,
} from 'echarts/components';

import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer, SVGRenderer } from 'echarts/renderers';

// 词云（扩展包，需与 echarts 5 配套）
// echarts-wordcloud 2.x 的 UMD 产物在 require('echarts') 后自行 echarts.use 注册，
// 没有命名导出 WordCloudChart（其 index.d.ts 仅声明 series option 接口），
// 故此处只做副作用导入；若写 import { WordCloudChart } 运行时拿到的是 undefined。
import 'echarts-wordcloud';

echartsCore.use([
  // 图表
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  EffectScatterChart,
  MapChart,
  GaugeChart,
  PictorialBarChart,
  RadarChart,
  FunnelChart,
  HeatmapChart,
  GraphChart,
  SankeyChart,
  // 组件
  GridComponent,
  TooltipComponent,
  RadarComponent,
  LegendComponent,
  DataZoomComponent,
  VisualMapComponent,
  MarkAreaComponent,
  MarkPointComponent,
  GraphicComponent,
  GeoComponent,
  TitleComponent,
  AxisPointerComponent,
  ToolboxComponent,
  DatasetComponent,
  CalendarComponent,
  // 特性
  LabelLayout,
  UniversalTransition,
  // 渲染器
  CanvasRenderer,
  SVGRenderer,
]);

// 业务侧取这些值（统一从主包取值，避免各文件重复写 'echarts' 全量导入）：
// - init / EChartsType / EChartsOption 一律取自主包，保证 init 返回值与 ref 标注同源；
//   echarts 5.6 的按需 core 与主包各自声明了带私有 _ssr 的实例类型，名义不互通，
//   故 init 与类型标注必须走同一来源（主包），否则会被判为不兼容；
// - 按需注册用 echarts/core 的 use()（见上方 echartsCore.use），以接受子路径导出的 core 组件类型。
export const init = echarts.init;
export const format = echarts.format;
export const graphic = echarts.graphic;
export const use = echartsCore.use;

export type EChartsType = EChartsMain.EChartsType;
export type EChartsOption = EChartsMain.EChartsOption;

export default echarts;
