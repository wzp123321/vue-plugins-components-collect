// 分析对象-treetype
export const treeTypeList = [
    { value: 1, label: '区域' },
    { value: 2, label: '业态' },
  ];
  //   输入类型枚举
export enum INPUT_TYPES {
  SEARCH_INPUT = 'search', // 普通查询
  NUMBER_INPUT = 'number', // 纯数字
  POSITIVE_INTEGER = 'positiveNumber', // 正整数
}
// 分页器每页数量
export const pageSizes = [10, 20, 30, 40, 50];

// 日志管理
export enum LOG_MANAGEMANT {
  SYSTEMEMS = 'system_ems', // 归属地
  OPERATION = 'operation', // 类型
 }