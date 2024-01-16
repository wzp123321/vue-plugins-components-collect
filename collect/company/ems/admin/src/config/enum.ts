export const MENU_TYPE = 0; // 后台菜单入参
// 树绑定
export enum TREE_BIND {
  AUTO_GENERATED = 0, // 树绑定默认值
}
// 对标体系
export enum BENCHMARKING_SYSTEM {
  REGION = 'region_type', // 医院所属地区
  HOSPITALLEVEL = 'hospital_level', // 医院等级
  HOSPITALTYPE = 'hospital_type', // 医院类型
  HEATINGMODE = 'heating_mode', // 供暖方式
  COOLINGMODE = 'cooling_mode', // 供冷方式
}

// 日志管理
export enum LOG_MANAGEMANT {
  SYSTEMEMS = 'system_ems', // 归属地
  OPERATION = 'operation', // 类型
}
//   输入类型枚举
export enum INPUT_TYPES {
  SEARCH_INPUT = 'search', // 普通查询
  NUMBER_INPUT = 'number', // 纯数字
  POSITIVE_INTEGER = 'positiveNumber', // 正整数
}
