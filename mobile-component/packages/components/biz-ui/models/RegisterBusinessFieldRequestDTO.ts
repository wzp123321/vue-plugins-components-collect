import RegisterBusinessFieldRequestDetailDTO from './RegisterBusinessFieldRequestDetailDTO';
export default class RegisterBusinessFieldRequestDTO {
  // 资产码
  assetCode: string = '';
  // 业务字段明细
  businessFieldList: Nullable<RegisterBusinessFieldRequestDetailDTO[]>;
}
