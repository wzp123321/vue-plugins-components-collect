/**
 * ECharts 亮 / 暗主题
 * --------------------------------------------------------------------------
 * 目的：让图表随页面主题（html.dark）自动切换，避免深色底上出现黑色轴文字（对比度约 1.2:1）。
 *
 * 两套颜色与 ai-theme.less 的设计令牌保持一致：
 * - 暗色：text #edf0f7 / dim #99a2b4 / mute #616a7d / border rgba(255,255,255,.08) / strong rgba(255,255,255,.16) / accent #7c5cff
 * - 亮色：text #101425 / dim #5a6478 / mute #8b93a5 / border rgba(15,23,42,.08) / strong rgba(15,23,42,.16) / accent #6d4bff
 * 注册用字面量（registerTheme 需要立即确定值，不能在注册时读 DOM）；
 * 运行期取值走 chartToken()，优先读 CSS 变量，保证与页面主题同源。
 */
import * as echarts from 'echarts';

export const CHART_THEME_LIGHT = 'ai-light';
export const CHART_THEME_DARK = 'ai-dark';

export type ChartTokenName = 'text' | 'textDim' | 'textMute' | 'border' | 'borderStrong' | 'surface' | 'accent';

const CSS_VARS: Record<ChartTokenName, string> = {
  text: '--ai-text',
  textDim: '--ai-text-dim',
  textMute: '--ai-text-mute',
  border: '--ai-border',
  borderStrong: '--ai-border-strong',
  surface: '--ai-surface-solid',
  accent: '--ai-accent',
};

const FALLBACK: Record<'light' | 'dark', Record<ChartTokenName, string>> = {
  light: {
    text: '#101425',
    textDim: '#5a6478',
    textMute: '#8b93a5',
    border: 'rgba(15, 23, 42, 0.08)',
    borderStrong: 'rgba(15, 23, 42, 0.16)',
    surface: '#ffffff',
    accent: '#6d4bff',
  },
  dark: {
    text: '#edf0f7',
    textDim: '#99a2b4',
    textMute: '#616a7d',
    border: 'rgba(255, 255, 255, 0.08)',
    borderStrong: 'rgba(255, 255, 255, 0.16)',
    surface: '#0e1017',
    accent: '#7c5cff',
  },
};

/** 当前是否暗色主题（html.dark 由 useThemeStore 维护，默认暗色） */
export const isChartDark = () =>
  typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

/** 取图表用色：优先读设计令牌，取不到再回退到内置值 */
export const chartToken = (name: ChartTokenName): string => {
  const mode = isChartDark() ? 'dark' : 'light';
  if (typeof document === 'undefined') return FALLBACK[mode][name];
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(CSS_VARS[name])
    .trim();
  return value || FALLBACK[mode][name];
};

const buildTheme = (mode: 'light' | 'dark') => {
  const c = FALLBACK[mode];
  return {
    // 画布透明，交给外层容器与页面背景
    backgroundColor: 'transparent',
    // 图表配色沿用项目既有色卡，不随主题变化（数据语义色）
    color: [
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
    textStyle: {
      color: c.textDim,
    },
    title: {
      textStyle: { color: c.text },
      subtextStyle: { color: c.textMute },
    },
    legend: {
      textStyle: { color: c.textDim },
      pageTextStyle: { color: c.textDim },
      pageIconColor: c.accent,
      pageIconInactiveColor: c.textMute,
    },
    categoryAxis: {
      nameTextStyle: { color: c.textDim },
      axisLine: { lineStyle: { color: c.borderStrong } },
      axisLabel: { color: c.textDim },
      axisTick: { lineStyle: { color: c.borderStrong } },
      splitLine: { lineStyle: { color: c.border } },
    },
    valueAxis: {
      nameTextStyle: { color: c.textDim },
      axisLine: { lineStyle: { color: c.borderStrong } },
      axisLabel: { color: c.textDim },
      axisTick: { lineStyle: { color: c.borderStrong } },
      splitLine: { lineStyle: { color: c.border } },
    },
    tooltip: {
      backgroundColor: c.surface,
      borderColor: c.border,
      borderWidth: 1,
      textStyle: { color: c.text },
    },
    dataZoom: {
      backgroundColor: c.surface,
      borderColor: c.border,
      fillerColor: 'rgba(124, 92, 255, 0.12)',
      handleStyle: { color: c.accent },
      textStyle: { color: c.textDim },
    },
    visualMap: {
      textStyle: { color: c.textDim },
    },
    geo: {
      label: { textStyle: { color: c.text } },
      itemStyle: { borderColor: c.borderStrong },
      emphasis: { label: { textStyle: { color: c.text } } },
    },
  };
};

echarts.registerTheme(CHART_THEME_LIGHT, buildTheme('light'));
echarts.registerTheme(CHART_THEME_DARK, buildTheme('dark'));
