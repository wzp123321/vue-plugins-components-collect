export interface FileManagementQueryFileListPageRequest {
  pageNum: number;
  pageSize: number;
  searchCount?: boolean;
  orders?: {
    column?: string;
    asc?: boolean;
  }[];
  /**
   * 租户ID
   */
  tenantId?: number;
  /**
   * 原始文件名称
   */
  origionName?: string;
  /**
   * 类别（1经营分析预算表）
   */
  category?: string;
  /**
   * 开始时间
   */
  startTime?: string;
  /**
   * 结束时间
   */
  endTime?: string;
}

export interface FileManagementQueryFileListPageResponse {
  pageNum?: number;
  pageSize?: number;
  total?: number;
  pages?: number;
  list?: {
    id?: number;
    tenantId?: number;
    origionName?: string;
    bucketName?: string;
    objectKey?: string;
    category?: string;
    categoryName?: string;
    type?: string;
    timeDimensionType?: string;
    timeDimension?: string;
    fileSize?: string;
    uploadTime?: string;
  }[];
}

export interface FileManagementListTableData {
  id?: number;
  tenantId?: number;
  origionName?: string;
  bucketName?: string;
  categoryName?: string;
  objectKey?: string;
  category?: string;
  type?: string;
  timeDimensionType?: string;
  timeDimension?: string;
  fileSize?: string;
  uploadTime?: string;
}

export interface FileManagementErrorDataList {
  detail: string;
  position: string;
}

export enum ImportType {
  初次导入 = 1,
  覆盖文件 = 0,
}

export interface FileManagementUploadFormData {
  fileType: string;
  timeFrame: string; // 时间范围
  timeFrameType: string;
}
