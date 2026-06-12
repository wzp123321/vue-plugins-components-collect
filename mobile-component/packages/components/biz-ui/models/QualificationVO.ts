import CertificatePhotoVO from './CertificatePhotoVO';
export default class QualificationVO {
  // 资质ID
  id: Nullable<string>;
  // 证书名称
  certificateName: Nullable<string>;
  // 证书批号
  approvalNumber: Nullable<string>;
  // 证书标号
  certificateNumber: Nullable<string>;
  // 发证日期
  effectiveDate: Nullable<string>;
  // 有效期限
  expiryDate: Nullable<string>;
  // 证件照片
  photos: Nullable<CertificatePhotoVO[]>;
}
