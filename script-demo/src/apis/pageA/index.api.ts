// 列表行类型
import { PageParam } from '../types';

export interface RowType {
  id: string | number;
  a: string;
  b: number;
}

// 详情类型
export interface DetailType {
  id: string;
  status: string;
}

export interface FormData {
  id?: string;
  seniorName: string;
  gender: string;
  idCard: string;
  birthDate: string;
  age: string;
  contact: string;
  nationality: string;
  ethnicGroup: string;
  maritalStatus: string;
  politicalStatus: string;
  educationLevel: string;
  currentAddress: string;
  currentAddressList: string[];
  currentAddressDetail: string;
  hukouAddress: string;
  hukouAddressList: string[];
  hukouAddressDetail: string;
  previousEmployer: string;
  occupation: string;
  remark: string;
  nativePlaceList: string[];
  nativePlace: string;
  birthPlaceList: string[];
  birthPlace: string;
  attachment: string;
  paymentMethod: string;
  currentZipCode: string;
  hukouZipCode: string;
  birthPlaceText: string;
  nativePlaceText: string;
}

/**
 * 分页查询相关
 */
export interface SortCol {
  column?: string;
  asc?: boolean;
}
export interface QueryParams extends PageParam {
  searchCount?: boolean;
  gender?: string;
  bedOccupancyStatus?: string;
  startCreateTime?: string;
  endCreateTime?: string;
  exportIds?: string[];
  orders?: SortCol[];
}

export interface DetailDTO {
  id: string;
  seniorName: string;
  bedId: string;
  gender: string;
  genderText: string;
  fileNo: string;
  idCard: string;
  birthDate: string;
  age: string;
  contact: string;
  nationality: string;
  nationalityText: string;
  ethnicGroup: string;
  marketCode: string;
  ethnicGroupText: string;
  maritalStatus: string;
  maritalStatusText: string;
  politicalStatus: string;
  politicalStatusText: string;
  educationLevel: string;
  educationLevelText: string;
  currentAddress: string;
  currentAddressText: string;
  currentAddressList: string[];
  currentAddressDetail: string;
  hukouAddress: string;
  hukouAddressText: string;
  hukouAddressList: string[];
  hukouAddressDetail: string;
  previousEmployer: string;
  occupation: string;
  occupationText: string;
  remark: string;
  bedLocation: string;
  bedOccupancyStatus: string;
  bedOccupancyStatusText: string;
  createByName: string;
  paymentMethodText: string;
  attachmentFileList: any[];
  createTime?: string;
  birthPlaceText: string;
  nativePlaceList: string[];
  nativePlace: string;
  nativePlaceText: string;
  birthPlaceList: string[];
  birthPlace: string;
  attachment: string;
  paymentMethod: string;
  currentZipCode: string;
  hukouZipCode: string;
}

export interface ContactsRow {
  id?: string;
  createTime?: string;
  updateTime?: string;
  createdBy?: string;
  updatedBy?: string;
  deleteFlag?: number;
  campusId?: string;
  relativesName?: string;
  relationship?: string;
  relationshipText?: string;
  contactNumber?: string;
  workingAddress?: string;
  createByName?: string;
  remark?: string;
  seniorId?: string;
}

// 床位变更入参
export interface BedChangeParams {
  seniorId: number;
  bedId: number;
  bedLocation: string;
  updateBedId: string;
}

// 获取联系人列表入参
export interface ContactListParams extends PageParam {
  searchCount?: boolean;
  orders?: SortCol[];
  seniorId: string;
}

export interface RowData {
  id: string;
  seniorName: string;
  gender: string;
  idCard: string;
  birthDate: string;
  fileNo: string;
  age: string;
  createByName: string;
  bedOccupancyStatus: string;
  bedLocation: string;
  locationId: string;
  bedId: string;
  campusId: string;
  deleteFlag: boolean;
  updatedBy: string;
  createdBy: string;
  updateTime: string;
  marketCode: string;
  createTime: string;
}

export interface BedInfo {
  value: string;
  label: string;
  disabled: 0 | 1;
  parent: string;
}

export interface HealthInfo {
  seniorId?: string;
  symptomStatus?: string;
  symptom: string[] | string;
  symptomText: string;
  symptomRemark: string;
  medicalHistoryStatus?: string;
  medicalHistory: string[] | string;
  medicalHistoryText: string;
  medicalHistoryRemark: string;
  allergy: string[] | string;
  allergyStatus?: string;
  allergyText: string;
  allergyRemark: string;
  diet: string[] | string;
  dietText: string;
  dietRemark: string;
  bowelBladderStatus?: string;
  bowelBladder: string[] | string;
  bowelBladderText: string;
  bowelBladderRemark: string;
  sleep: string[] | string;
  sleepText: string;
  sleepStatus?: string;
  sleepRemark: string;
}
