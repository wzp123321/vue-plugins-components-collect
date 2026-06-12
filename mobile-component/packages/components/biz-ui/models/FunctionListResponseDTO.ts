import FunctionLocationDTO from './FunctionLocationDTO';
export default class FunctionListResponseDTO {
  // 功能属性ID
  id: Nullable<string>;
  // 功能属性名称
  name: Nullable<string>;
  // 上级功能属性id
  parentId: Nullable<string>;
  // 子孙功能属性绑定的空间信息，fetchParts传location时返回
  distributeLocations: Nullable<FunctionLocationDTO[]>;
}
