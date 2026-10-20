/*
 * @Author: yanghui yanghui@tiansu-china.com
 * @Date: 2024-03-27 17:39:24
 * @LastEditors: yanghui yanghui@tiansu-china.com
 * @LastEditTime: 2024-04-19 09:54:03
 * @Description: 
 */
/**
 * 表格数据是否为数组
 */
export const isArray = (val: any): val is Array<any> => {
  return val && Array.isArray(val)
}

/**
 * @description 处理值无数据情况
 * @param {*} callValue 需要处理的值
 * @returns {String}
 */
export const formatValue = (callValue: any) => {
  // 如果当前值为数组，使用 ， 拼接（根据需求自定义）
  if (isArray(callValue)) return callValue.length ? callValue.join('，') : '-'
  return callValue ?? '-'
}

/**
 * @param {Object} row 当前行数据
 * @param {String} prop 当前 prop
 * @returns {String}
 */
export const handleProp = (row: { [key: string]: any }, prop: string) => {
  if (row[prop] === null || row[prop] === undefined || row[prop] === '') {
    return '-'
  }
  return row[prop]
}

/**
 * @description 简单的防抖
 */
export function debounce(fn: any, delay: any) {
  let timer: any = null
  return function () {
    timer != null ? clearTimeout(timer) : null
    timer = setTimeout(() => {
      fn && fn() //当有值才会执行
    }, delay)
  }
}
