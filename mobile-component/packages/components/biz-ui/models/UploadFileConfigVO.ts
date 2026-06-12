import LocalDateTime from './LocalDateTime';
export default class UploadFileConfigVO {
  // 上传文件相关配置id
  id: Nullable<string>;
  // 功能编码
  code: Nullable<string>;
  // 文件类型，逗号分割（示例：png,jpg,doc）
  fileType: Nullable<string>;
  // 功能编码
  fileSize: Nullable<string>;
  // 创建时间
  createTime: Nullable<LocalDateTime>;
  // 更新时间
  updateTime: Nullable<LocalDateTime>;
}
