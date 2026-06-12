import { DistributeQueryFunctionStrategyEnum } from './DistributeQueryFunctionStrategyEnum';
import { LocationTypeEnum } from './LocationTypeEnum';
export default class LocationFunctionListRequestDTO {
  // 查询策略
  queryStrategy: Nullable<DistributeQueryFunctionStrategyEnum>;
  // 空间id
  locIdEq: Nullable<string>;
  // 查询空间下钻相对层级数：传负数表示查询全部
  locRelativeLevels: Nullable<number>;
  // 查询指定空间类型
  locTypeEq: Nullable<LocationTypeEnum>;
  // 功能属性id
  functionIdEq: Nullable<string>;
  // 查询功能属性绝对层级数： 根节点从1算起
  functionAbsoluteLevels: Nullable<number>;
  // 查询功能属性下钻相对层级数：传负数表示查询全部
  functionRelativeLevels: Nullable<number>;
  // 查询扩展的信息： 支持【location】；
  fetchParts: Nullable<string[]>;
}
