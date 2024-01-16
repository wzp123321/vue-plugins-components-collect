/**
 * 根据serialNumber生成维护数据中公式容器唯一标识，用于判断是否可拖拽
 * @param {string} serialNumber
 * @returns {string}
 */
export const mapServiceAffiliationClass = (serialNumber: string): string => {
  return `service-data-${serialNumber}-container`;
};

/**
 * 替换<为&lt;   >为&gt;
 * @param sym
 * @returns
 */
export const replaceSpecificSymbol = (sym: string):string => {
  const speMap = new Map([
    ['>', '&gt;'],
    ['<', '&lt;'],
  ]);
  return speMap.has(sym) ? speMap.get(sym) as string : sym;
};
