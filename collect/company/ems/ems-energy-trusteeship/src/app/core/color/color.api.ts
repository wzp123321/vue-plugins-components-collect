export const LINE_CHART_COLOR_LIST = [
  'rgba(54, 129, 255, 1)',
  'rgba(255, 145, 32, 1)',
  'rgba(255, 203, 32, 1)',
  'rgba(0, 178, 97, 1)',
  'rgba(254, 75, 78, 1)',
  'rgba(68, 58, 255, 1)',
  'rgba(168, 59, 255, 1)',
  'rgba(0, 165, 178, 1)',
  'rgba(217, 16, 38, 1)',
  'rgba(236, 80, 210, 1)',
];
Object.freeze(LINE_CHART_COLOR_LIST);

export const CHART_COLOR_OPTIONS = {
  DEFAULT: 'rgba(255, 255, 255, 1)',
  PRIMARY: 'rgba(24, 144, 255, 1)',
  DISABLE: 'rgba(0, 0, 0, 0.25)',
  TEXT: 'rgba(0, 0, 0, 0.65)',
  LINE: 'rgba(217, 217, 217, 1)',
};
Object.freeze(CHART_COLOR_OPTIONS);

export function FMixinAlpha(color: string, alpha: number = 0): string {
  return color?.replace(/\d+(?=\))/, (alpha ?? 0).toString()) ?? null;
}
