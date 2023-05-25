/**
 * 根据字符串计算文本长度
 * @param label
 * @returns
 */
export const mapLabelWidth = (label: string): number => {
  const element = document.createElement('span');
  element.style.visibility = 'hidden';
  element.style.position = 'absolute';
  element.style.fontSize = '14px';
  element.innerHTML = label;
  document.body.appendChild(element);
  const width = element.clientWidth;
  document.body.removeChild(element);
  return width;
};
