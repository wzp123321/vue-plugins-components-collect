export default class ProjectListDTO {
  // 项目ID
  id: string = '';
  // 项目名称
  name: string = '';
  code: string = '';
  group: Nullable<{
    // 项目ID
    id: string;
    // 项目名称
    name: string;
  }>;
  fullName: string = '';
}
