export function FFormConverter(data: object): FormData;
/**
 * 表单数据转换器
 * @param data 源数据
 * @returns 源数据转换后的表单数据
 */
export function FFormConverter(data: object): FormData {
  const form = new FormData();
  Object.entries(data).forEach(([k, v]) => form.append(k, v));
  return form;
}
