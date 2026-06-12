import CreateAndActivateCodeRequestBusinessDTO from './CreateAndActivateCodeRequestBusinessDTO';
export default class BatchCreateAndActivateCodeRequestDTO {
  // 资产码
  assetCode: string = '';
  // 业务对象
  businessList: Nullable<CreateAndActivateCodeRequestBusinessDTO[]>;
}
