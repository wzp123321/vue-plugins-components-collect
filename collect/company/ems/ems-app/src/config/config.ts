/*
 * @Author: yut
 * @Date: 2023-12-06 15:18:19
 * @LastEditors: wanzp wanzp@tiansu-china.com
 * @LastEditTime: 2023-12-27 16:42:56
 * @Descripttion:
 */
// charts图表颜色组HEX
export const CHARTS_COLOR_GROUP_HEX = [
  '#0E6DFA',
  '#13C2C2',
  '#FAAD14',
  '#FA8C16',
  '#FA541C',
  '#722ED1',
  '#DB1ADB',
  '#EB2F96',
  '#1890FF',
  '#52C41A',
  '#A0D911',
  '#F9DB15',
];
// 能源类型对应颜色
export const CHARTS_ENERGY_CODE_COLOR_MAP = new Map<string, string>([
  ['01000', '#0e6dfa'], // 电
  ['02000', '#13c2c2'], // 水
  ['03000', '#faad14'], // 燃气
  ['14000', '#fa541c'], // 市政热水
  ['20000', '#fa8c16'], // 蒸汽
]);

// 能源类型对应颜色
export const CHARTS_ENERGY_NAME_COLOR_MAP = new Map<string, string>([
  ['电', '#0e6dfa'], // 电
  ['水', '#13c2c2'], // 水
  ['燃气', '#faad14'], // 燃气
  ['市政热水', '#fa541c'], // 市政热水
  ['蒸汽', '#fa8c16'], // 蒸汽
]);

/**
 * 图表中能源类型对应颜色
 * @param {string} code
 * @returns {string}
 */
export const mapEnergyColorByCode = (code: string, defaultColor: string = 'rgb(114, 46, 209)'): string => {
  return CHARTS_ENERGY_CODE_COLOR_MAP?.has(code)
    ? CHARTS_ENERGY_CODE_COLOR_MAP.get(code) ?? defaultColor
    : defaultColor;
};

/**
 * 图表中能源类型对应颜色
 * @param {string} name
 * @returns {string}
 */
export const mapEnergyColorByName = (name: string, defaultColor: string = 'rgb(114, 46, 209)'): string => {
  return CHARTS_ENERGY_NAME_COLOR_MAP?.has(name)
    ? CHARTS_ENERGY_NAME_COLOR_MAP.get(name) ?? defaultColor
    : defaultColor;
};

// 默认面包屑
export const COMMON_DEFAULT_BREADCRUMB = [
  {
    id: 0,
    treeName: '',
  },
];

/**
 * 定额类型
 */
export const quotaTypeList = [
  {
    label: '月',
    code: '1',
  },
  {
    label: '年',
    code: '2',
  },
];
