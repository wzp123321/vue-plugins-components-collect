import ProjectSimpleDTO from './ProjectSimpleDTO';
export default class ProjectGroupTreeNodeDTO {
  // 项目分组id
  id: string = '';
  // 项目分组名称
  name: string = '';
  // 父级项目分组id
  parentId: string = '';
  // 分组下的项目列表
  projectList: ProjectSimpleDTO[] = [];
  // 是否有下属项目分组
  hasChildren: boolean = false;
  // 直属下级项目分组
  children: Nullable<ProjectGroupTreeNodeDTO[]>;
}
