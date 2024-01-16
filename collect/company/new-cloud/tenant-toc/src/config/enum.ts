/**
 * 所有枚举
 */

export enum ENERGY {
  DISABLED_CODE = '00000',
}

// 字典类型
export enum DICTIONARY_TYPE {
  DISABLED_FIXED_CODE = '1',
}

// 菜单管理
export enum MENU_MANAGEMENT {
  ADD_CODE = '1',
  EDIT_CODE = '2',
  ADD_CHILDREN_CODE = '3',
}

/**
 * 下拉框字典
 * @param TENANT 租户管理
 * @param DEVICE_MODEL 设备型号
 * @param DICTIONARY_TYPE 字典类型
 * @param DICTIONARY_CONFIGURE 字典明细
 * @param STANARD_POINT 标准点位
 */
export enum DICTIONARY_SELECT {
  TENANT = 'status',
  DEVICE_MODEL = 'device_genre',
  DICTIONARY_TYPE = 'dict_type',
  DICTIONARY_CONFIGURE = 'status',
  STANARD_POINT = 'point_type',
}

//   输入类型枚举
export enum INPUT_TYPES {
  SEARCH_INPUT = 'search', // 普通查询
  NUMBER_INPUT = 'number', // 纯数字
  POSITIVE_INTEGER = 'positiveNumber', // 正整数
  NATURAL_NUMBER_INPUT = 'naturalNumber', // 自然数
  MAXVALUE_NUMBER_INPUT = 'maxValueNumber', // 限制最大值输入
}

// 文件类型
export enum FILE_TYPE {
  PNG = 'png',
  JPG = 'jpg',
  JPEG = 'jpeg',
  WORD = 'doc',
  WORDX = 'docx',
  XLS = 'xls',
  XLSX = 'xlsx',
  XLSM = 'xlsm',
  PDF = 'pdf',
  PPTX = 'pptx',
}

export enum MENU_TYPE {
  DEFAULT = '-1',
  TENANT = '0', // tenant模块
  MENU = '1', // 菜单 项目级
  FEATURE = '2', //功能
}

/**
 * 菜单访问记录是否需要存储
 */
export enum EHostMenuFlag {
  不需要 = '0',
  需要 = '1',
}

export enum Common_EUserRole {
  系统超级管理员 = 'administrator',
  总部专家 = 'headquartersExperts',
  方案专家 = 'solutionExperts',
  财务专家 = 'financiaExperts',
  能源经理 = 'energyExperts',
  运营专家 = 'operatorExperts',
  重装旅 = 'reloadBrigade',
}
