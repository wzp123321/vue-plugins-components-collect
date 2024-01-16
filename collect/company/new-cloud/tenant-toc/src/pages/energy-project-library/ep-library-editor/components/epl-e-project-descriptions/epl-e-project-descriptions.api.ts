export interface ProjectDescriptionsData {
  id?: number;
  /**
   * 医院名称
   */
  hospitalName?: string;
  /**
   * '对标库简称'
   */
  benchmarkSimpleName?: string;
  /**
   * '医院简称'
   */
  hospitalSimpleName?: string;
  /**
   * 录入省份
   */
  provinceName?: string;
  /**
   * 录入城市
   */
  city?: string;
  /**
   * 医院等级
   */
  hospitalLevel?: string;
  /**
   * 医院类型
   */
  hospitalType?: string;
  /**
   * 录入人员
   */
  operator?: string;
  realName?: string;
  /**
   * 绑定项目
   */
  bindHostingProjectName?: string;
  /**
   * 删除权限
   */
  deletePermission?: number;
}
