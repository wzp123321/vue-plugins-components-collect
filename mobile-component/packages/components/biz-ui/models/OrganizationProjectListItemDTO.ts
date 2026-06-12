import ProjectListDTO from './ProjectListDTO';
export default class OrganizationProjectListItemDTO {
  // 机构id
  organizationId: Nullable<string>;
  // 院区id
  projectId: Nullable<string>;
  // 院区
  project: Nullable<ProjectListDTO>;
}
