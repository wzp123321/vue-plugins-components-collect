declare namespace NHouseholdNumber {
  /**
   * 查询表单
   */
  export interface SearchForm extends GeneralModule.CommonQueryParams {
    accountNumber: string;
    energyCode: string;
    year: any;
  }
  /**
   * 查询参数
   */
  export interface SearchParams extends SearchForm {
    year: string;
    tenantCode: string;
    tenantId: number;
  }
  /**
   * 详情
   */
  export interface AccountNumberInfo {
    accountNumber: string;
    actualPayment: string;
    actualPrice: string;
    amount: string;
    attachmentIds: string;
    billEndTime: string;
    billStartTime: string;
    id: number;
    month: string;
    treeName: string;
    unit: string;
    fileVOList: FileVO[];
    energyCode: string;
    energyName: string;
    energyUnit: string;
  }
  /**
   * 文件
   */
  export interface FileVO {
    fileName: string;
    fileId: number;
  }
  /**
   * 新增、编辑表单
   */
  export interface EntryForm {
    id?: number;
    energyCode: string;
    accountNumber: string;
    date: any;
    amount: string;
    actualPayment: string;
    billDate: any;
    fileList: File[];
  }
  /**
   * 新增入参
   */
  export interface CreateParams {
    file: File[];
    accountNumber: string;
    actualPayment: string;
    amount: string;
    billEndTime: string;
    billStartTime: string;
    energyCode: string;
    tenantCode: string;
    tenantId: number;
    yearMonth: string;
  }
  /**
   * 编辑入参
   */
  export interface EditorParams extends CreateParams {
    id: number;
  }
  /**
   * 查询账期参数
   */
  export interface QueryBillTimeParams {
    energyCode: string;
    tenantCode: string;
    tenantId: number;
    yearMonth: string;
  }
  /**
   * 查询账期返回值
   */
  export interface BillTimeVO {
    billEndTime: string;
    billStartTime: string;
    energyCode: string;
  }
  /**
   * 分类分项
   */
  export interface EnergyCodeVO {
    code: string;
    name: string;
    unit: string;
  }
  /**
   * 导入入参
   */
  export interface ImportParams extends GeneralModule {
    file: File;
  }
  /**
   * 导入错误
   */
  export interface ImportExceptionVO {
    position: string;
    detail: string;
  }
}
