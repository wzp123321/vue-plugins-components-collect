import { postRequest } from '@/services/request';
import { ref } from 'vue';
import commonService from '@/services/common/common.service';
import { Common_IObject } from '@/services/common/common-api';
import { getCampusParams } from '@/utils/token';

enum EPath {
  表格明细 = '/energyAnalyse/queryDepartmentEnergyDetails',
  导出明细 = '/energyAnalyse/exportDepartmentEnergyDetails',
}

export class OfficeDetailService {
  private _tableParams: TableParams = {
    endTime: '',
    energyCode: '',
    startTime: '',
    treeId: 0,
    hospitalCodeList: [],
    wholeHospitalFlag: true,
  };
  private _dataSource = ref<Common_IObject[]>([]);
  private _unit = ref<string>('');
  private _loading = ref(false);

  private _exportLoading = false;

  public get dataSource(): Common_IObject[] {
    return this._dataSource.value;
  }
  public get unit(): string {
    return this._unit.value;
  }
  public get loading() {
    return this._loading.value;
  }
  public get tableParams() {
    return this._tableParams;
  }

  async query() {
    this._loading.value = true;
    this._dataSource.value = [];

    this._tableParams = {
      ...this._tableParams,
      ...getCampusParams(),
    };
    try {
      const res: HttpRequestModule.ResTemplate<EOED_IDetailTableVO> = await postRequest(
        EPath.表格明细,
        this._tableParams,
      );

      if (res?.code === 200) {
        this._dataSource.value = res?.data?.table;
        this._unit.value = res?.data?.unit;
      }
    } catch (error) {
      this._dataSource.value = [];
      console.log('%c✨✨查询能耗明细Error✨✨', 'font-size: 24px', error);
    } finally {
      this._loading.value = false;
    }
  }
  /**
   * 导出明细
   * @returns
   */
  public exportDetail() {
    if (!this._exportLoading) {
      this._exportLoading = true;
      commonService.getFileStreamDownload(
        this._tableParams,
        EPath.导出明细,
        '导出',
        () => {
          this._exportLoading = false;
        },
        () => {
          this._exportLoading = false;
        },
      );
    }
  }
}

export interface OfficeDetail {
  name: string;
  stripeIndex: number;
}

export interface ColumnsItem {
  title: string;
}

export interface TableParams {
  endTime: string;
  energyCode: string;
  startTime: string;
  treeId: number;
  hospitalCodeList: string[];
  wholeHospitalFlag: boolean;
}

// 明细表格
export interface EOED_IDetailTableVO {
  table: EOED_ITable[];
  head: string[];
  unit: string;
}

export interface EOED_ITable {
  lastMonthRatio: number | null;
  lastMonthValue: number | null;
  lastYearRatio: number | null;
  lastYearValue: number | null;
  name: string;
  time: string;
  treeId: number;
  type: number | null;
  value: number | null;
}

export interface CommonObject {
  [key: string]: string;
}
