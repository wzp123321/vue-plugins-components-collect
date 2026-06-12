export default class QrCodeTemplateVO {
  // 模板id
  id: Nullable<string>;
  // 二维码模板key
  templateKey: Nullable<string>;
  // 打印样式
  templateStyle: Nullable<string>;
  // 二维码配置顶层图片地址
  topLogo: Nullable<string>;
  // 二维码中间图片地址
  botLogo: Nullable<string>;
  // 二维码标题
  title: Nullable<string>;
  // 租户Id
  tenantId: Nullable<string>;
}
