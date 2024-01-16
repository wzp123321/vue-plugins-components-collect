import { PM_EGrainSharingMode } from '../../../constant/enum';

export interface PGS_IGrainSharingVO {
  type: PM_EGrainSharingMode | null;
  // 国网/资方是否勾选
  stateFlag: boolean;
  // 固定收益、收益分享
  stateTypes: number[];
  // 院方是否勾选
  hospitalFlag: boolean;
  // 院方-分享收益是否勾选
  hospitalTypes: number[]
  // 备注
  remark: string;
}
