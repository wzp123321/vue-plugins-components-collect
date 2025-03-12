/*****************************数字相关的工具方法***************************************/
/**
 * 解决加法导致精度丢失
 * @param arg1 参数1
 * @param arg2 参数2
 * @returns
 */
export const floatAdd = (arg1: number, arg2: number) => {
  let r1;
  let r2;
  try {
    r1 = arg1.toString().split('.')[1].length;
  } catch (e) {
    r1 = 0;
  }
  try {
    r2 = arg2.toString().split('.')[1].length;
  } catch (e) {
    r2 = 0;
  }
  const m = Math.pow(10, Math.max(r1, r2));
  return (Number(floatMultiply(arg1, m)) + Number(floatMultiply(arg2, m))) / m;
};

/**
 * 解决减法导致精度丢失
 * @param arg1
 * @param arg2
 * @returns
 */
export const floatSub = (arg1: number, arg2: number) => {
  let r1;
  let r2;
  try {
    r1 = arg1.toString().split('.')[1].length;
  } catch (e) {
    r1 = 0;
  }
  try {
    r2 = arg2.toString().split('.')[1].length;
  } catch (e) {
    r2 = 0;
  }
  const m = Math.pow(10, Math.max(r1, r2));
  // 动态控制精度长度
  const n = r1 >= r2 ? r1 : r2;
  return (
    (Number(floatMultiply(Number(arg1), Number(m))) - Number(floatMultiply(Number(arg2), Number(m)))) /
    m
  ).toFixed(n);
};

/**
 * 解决乘法导致精度丢失
 * @param arg1
 * @param arg2
 * @returns
 */
export const floatMultiply = (arg1: number, arg2: number) => {
  if (arg1 == null || arg2 == null) {
    return null;
  }
  let r1;
  let r2; // 小数位数
  try {
    r1 = arg1.toString().split('.')[1].length;
  } catch (e) {
    r1 = 0;
  }
  try {
    r2 = arg2.toString().split('.')[1].length;
  } catch (e) {
    r2 = 0;
  }
  const n1 = Number(arg1.toString().replace('.', ''));
  const n2 = Number(arg2.toString().replace('.', ''));
  return (n1 * n2) / Math.pow(10, r1 + r2);
};

/**
 * 解决除法导致精度丢失
 * @param arg1
 * @param arg2
 * @returns
 */
export const floatDivide = (arg1: number, arg2: number) => {
  if (arg1 == null) {
    return null;
  }
  if (arg2 == null || arg2 == 0) {
    return null;
  }
  let r1;
  let r2; // 小数位数
  try {
    r1 = arg1.toString().split('.')[1].length;
  } catch (e) {
    r1 = 0;
  }
  try {
    r2 = arg2.toString().split('.')[1].length;
  } catch (e) {
    r2 = 0;
  }
  const n1 = Number(arg1.toString().replace('.', ''));
  const n2 = Number(arg2.toString().replace('.', ''));
  return floatMultiply(n1 / n2, Math.pow(10, r2 - r1));
  // return (n1 / n2) * Math.pow(10, r2 - r1);
};

/**
 * 阿拉伯数字转中文
 * @param num
 * @returns
 */
export const convertToChinaNum = (num: number) => {
  const arr1 = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  const arr2 = ['', '十', '百', '千', '万', '十', '百', '千', '亿', '十', '百', '千', '万', '十', '百', '千', '亿']; //可继续追加更高位转换值
  if (!num || isNaN(num)) {
    return '零';
  }
  const english = num.toString().split('');
  let result = '';
  for (let i = 0; i < english.length; i++) {
    const des_i = english.length - 1 - i; //倒序排列设值
    result = arr2[i] + result;
    const arr1_index = english[des_i] as any;
    result = arr1[arr1_index] + result;
  }
  //将【零千、零百】换成【零】 【十零】换成【十】
  result = result.replace(/零(千|百|十)/g, '零').replace(/十零/g, '十');
  //合并中间多个零为一个零
  result = result.replace(/零+/g, '零');
  //将【零亿】换成【亿】【零万】换成【万】
  result = result.replace(/零亿/g, '亿').replace(/零万/g, '万');
  //将【亿万】换成【亿】
  result = result.replace(/亿万/g, '亿');
  //移除末尾的零
  result = result.replace(/零+$/, '');
  //将【零一十】换成【零十】
  //result = result.replace(/零一十/g, '零十');//貌似正规读法是零一十
  //将【一十】换成【十】
  result = result.replace(/^一十/g, '十');
  return result;
};
/**
 * 生成数字数组
 * @param {number} start
 * @param {number} end
 * @returns {number[]}
 */
export const makeRange = (start: number, end: number): number[] => {
  const result: number[] = [];
  for (let index = start; index <= end; index++) {
    result.push(index);
  }
  return result;
};
