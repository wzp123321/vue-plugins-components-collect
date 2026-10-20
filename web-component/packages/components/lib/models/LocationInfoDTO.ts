import DepartmentDTO from './DepartmentDTO';
import ProjectDTO from './ProjectDTO';
export default class LocationInfoDTO {
  // id
  id: Nullable<string>;
  // 编码
  code: Nullable<string>;
  // 名称
  name: Nullable<string>;
  // 上级空间id
  parentId: Nullable<string>;
  // 全路径id
  idPath: Nullable<string>;
  // 全路径名称
  namePath: Nullable<string>;
  // 空间类型：PROJECT-项目；BUILDING-建筑；FLOOR-楼层；ROOM-房间
  locType: Nullable<string>;
  // 院区信息
  project: Nullable<ProjectDTO>;
  // 责任部门信息
  responsibleDept: Nullable<DepartmentDTO>;
}
