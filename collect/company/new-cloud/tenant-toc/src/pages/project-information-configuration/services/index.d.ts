declare namespace ProjectInformationConfigurationList {
  /**
   * 查询 表格list 入参
   * @param name 项目名
   * @param status 状态
   * @param page 页码
   * @param pageSize 每页条数
   */
  export interface SearchForm extends GeneralModule.CommonQueryParams {
    projectName: string;
    status?: string;
    pageNum: number;
    pageSize: number;
  }
  /**
   * 表格 list 返回值
   * @param code： 租户编码
   * @param emsHost: 	ems跳转路径
   * @param emsVersion: ems版本
   * @param fileName: 图片名称
   * @param name: 	租户名称
   */
  export interface ProjectVO {
    code: string;
    emsHost: string;
    emsVersion: string;
    fileName: string;
    id: number;
    name: string;
  }

  /**
   * 编辑弹框表单
   * @param name ems端侧地址
   * @param status logo
   * @param dialogFormVisible 控制弹框显示隐藏
   * @param pageSize 每页条数
   */
  export interface EditDialogForm {
    emsAddress: string;
    emsVersion: string;
    uploadLogo: string | undefined;
    picEditDialogVisible: boolean;
  }

  /**
   * 预览项目管理配置logo和跳转路径 入参
   * @param tenantCode 	租户编码
   * @param tenantId 	租户ID
   */
  export interface QuerySingleTenantConfigParams {
    tenantCode: string;
    tenantId: number;
  }
  /**
   * 预览项目管理配置logo和跳转路径 返回值
   * @param tenantCode 	租户编码
   * @param tenantId 	租户ID
   */
  export interface QuerySingleTenantConfigVO {
    tenantCode: string;
    tenantId: number;
    emsVersion: string;
    logoUrl: string;
    emsHost: string;
  }
  /**
   * 上传图片文件
   */
  export interface imgFileType {
    type: string;
    size: number;
    name: string;
  }
  /**
   * ems版本list
   */
  export interface EmsVersionType {
    code: string;
    name: string;
  }
}
