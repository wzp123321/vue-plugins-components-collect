/**
 * 混入透明度
 * !仅限处理rgba格式颜色
 * @param color 色值
 * @param alpha 透明度
 * @returns 合成色值
 */
export function FMixinAlpha(color: string, alpha: number = 0): string {
  return color?.replace(/\d+(?=\))/, (alpha ?? 0).toString()) ?? null;
}
