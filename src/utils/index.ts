import dayjs from 'dayjs'

/**
 * 日期格式化
 * @param timeStamp
 * @param formatStr
 * @returns
 */
export const formatDate = (timeStamp: number | Date, formatStr: string) => {
  return dayjs(timeStamp).format(formatStr)
}

/**
 * 解决加法导致精度丢失
 * @param arg1 参数1
 * @param arg2 参数2
 * @returns
 */
export const floatAdd = (arg1: number, arg2: number) => {
  let r1
  let r2
  try {
    r1 = arg1.toString().split('.')[1].length
  } catch (e) {
    r1 = 0
  }
  try {
    r2 = arg2.toString().split('.')[1].length
  } catch (e) {
    r2 = 0
  }
  const m = Math.pow(10, Math.max(r1, r2))
  return (Number(floatMultiply(arg1, m)) + Number(floatMultiply(arg2, m))) / m
}

/**
 * 解决减法导致精度丢失
 * @param arg1
 * @param arg2
 * @returns
 */
export const floatSub = (arg1: number, arg2: number) => {
  let r1
  let r2
  try {
    r1 = arg1.toString().split('.')[1].length
  } catch (e) {
    r1 = 0
  }
  try {
    r2 = arg2.toString().split('.')[1].length
  } catch (e) {
    r2 = 0
  }
  const m = Math.pow(10, Math.max(r1, r2))
  // 动态控制精度长度
  const n = r1 >= r2 ? r1 : r2
  return (
    (Number(floatMultiply(Number(arg1), Number(m))) -
      Number(floatMultiply(Number(arg2), Number(m)))) /
    m
  ).toFixed(n)
}

/**
 * 解决乘法导致精度丢失
 * @param arg1
 * @param arg2
 * @returns
 */
export const floatMultiply = (arg1: number, arg2: number) => {
  if (arg1 == null || arg2 == null) {
    return null
  }
  let r1
  let r2 // 小数位数
  try {
    r1 = arg1.toString().split('.')[1].length
  } catch (e) {
    r1 = 0
  }
  try {
    r2 = arg2.toString().split('.')[1].length
  } catch (e) {
    r2 = 0
  }
  const n1 = Number(arg1.toString().replace('.', ''))
  const n2 = Number(arg2.toString().replace('.', ''))
  return (n1 * n2) / Math.pow(10, r1 + r2)
}

/**
 * 解决除法导致精度丢失
 * @param arg1
 * @param arg2
 * @returns
 */
export const floatDivide = (arg1: number, arg2: number) => {
  if (arg1 == null) {
    return null
  }
  if (arg2 == null || arg2 == 0) {
    return null
  }
  let r1
  let r2 // 小数位数
  try {
    r1 = arg1.toString().split('.')[1].length
  } catch (e) {
    r1 = 0
  }
  try {
    r2 = arg2.toString().split('.')[1].length
  } catch (e) {
    r2 = 0
  }
  const n1 = Number(arg1.toString().replace('.', ''))
  const n2 = Number(arg2.toString().replace('.', ''))
  return floatMultiply(n1 / n2, Math.pow(10, r2 - r1))
  // return (n1 / n2) * Math.pow(10, r2 - r1);
}
