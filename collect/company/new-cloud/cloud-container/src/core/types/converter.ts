/**
 *
 * @param target 目标数字串
 * @returns
 */
export function FConvertToNumber(target: string): number | undefined {
  if (!target) {
    return;
  }

  return isNaN(+target) ? undefined : +target;
}
