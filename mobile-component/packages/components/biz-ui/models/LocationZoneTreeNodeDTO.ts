import IdName from './IdName';
import IdNameDeleted from './IdNameDeleted';
export default class LocationZoneTreeNodeDTO extends IdNameDeleted {
  // 上级节点信息
  parent: IdName = new IdName();
  // 所在项目id
  projectId: string = '';
  // 是否有子节点
  hasChildren: boolean = false;
  // 直属下级
  children: Nullable<LocationZoneTreeNodeDTO[]>;
}
