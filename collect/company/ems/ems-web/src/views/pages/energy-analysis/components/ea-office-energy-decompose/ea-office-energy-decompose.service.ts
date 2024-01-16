import { getCampusParams } from '@/utils/token';
import { postRequest } from '@/services/request';
import { ref } from 'vue';
import { Common_ETimeUnit, Common_IObject } from '@/services/common/common-api';
import { ITHCompareVO, checkHasTHCompare } from '../../utils/check';
import { EOED_ENodeTye } from './ea-office-energy-decompose.api';

const enum PATH {
  饼图数据 = '/energyAnalyse/queryDepartmentEnergyPieChart',
}

export enum EOED_EState {
  正常 = '0',
  异常 = '1',
}

export class OfficeDecomposeService {
  private _pieParams: PieParams = {
    endTime: '',
    energyCode: '',
    startTime: '',
    treeId: 0,
    hospitalCodeList: [],
    wholeHospitalFlag: true,
  };

  parentTreeId = 0;
  dataDrillingNameArr = ref<ItemCode[]>([]);

  loading = ref(true);
  // 是否是叶子节点
  isLeafValue = ref(false);

  currentPieData: ItemCode[] = [];

  pieData: ItemCode[] = [];
  // 当前能耗
  energyType = ref<string>('');
  // 单位
  unit = ref<string>('');
  //  环比时间
  lastMonthDate = ref<string>('');
  //  同比时间
  lastYearDate = ref<string>('');
  pieTitle = ref<string>('');
  pieTotal = ref<number | string>('--');

  tableData = ref<Common_IObject[]>([]);
  tableHead = ref<string[]>([]);

  get pieParams() {
    return this._pieParams;
  }

  async query() {
    this.loading.value = true;
    this.currentPieData = this.pieData;

    this._pieParams = {
      ...this._pieParams,
      ...getCampusParams(),
    };
    try {
      const res: HttpRequestModule.ResTemplate<PieResVO> = await postRequest(PATH.饼图数据, this._pieParams);
      if (res?.code === 200) {
        if (this.pieData.length === 0) {
          this.currentPieData = res.data?.pieChart?.pieChartSeriesList?.[0]?.pieChartDataList ?? [];
        }
        this.pieData = res.data?.pieChart?.pieChartSeriesList?.[0]?.pieChartDataList ?? [];
        this.energyType.value = res?.data?.pieChart?.pieChartSeriesList?.[0]?.energyType ?? '';
        this.unit.value = res?.data?.pieChart?.yaxisItemList?.[0]?.unit ?? '';
        this.pieTitle.value = res.data?.treeName ?? '';
        this.pieTotal.value = res.data?.currentTotalEnergyValue;

        const isMH = checkHasTHCompare(Common_ETimeUnit.天, [this._pieParams.startTime, this._pieParams.endTime]);
        this.mapTableData(res?.data?.tableHead, res?.data?.tableData, isMH, res?.data?.nodeType);

        this.tableHead.value = res.data?.tableHead ?? [];
        this.isLeafValue.value = res.data?.nodeType === EOED_ENodeTye.设备节点;

        this.lastMonthDate.value = res?.data?.lastMonthDate ?? '';
        this.lastYearDate.value = res?.data?.lastYearDate ?? '';
        if (res.data?.pieChart) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } catch (error) {
      return false;
    } finally {
      this.loading.value = false;
    }
  }

  private mapTableData(head: string[], data: string[][], isMH: ITHCompareVO, nodeType: string) {
    this.tableData.value = [];
    if (head?.length) {
      this.tableData.value = data?.map((item) => {
        let obj = {};
        head?.forEach((hItem, hIndex) => {
          obj = {
            ...obj,
            [hItem]: item[hIndex],
          };
        });
        obj = {
          ...obj,
          tbFlag:
            nodeType === EOED_ENodeTye.科室节点 &&
            item?.length >= head?.length + 1 &&
            isMH.tbFlag &&
            item[head?.length] === EOED_EState.异常,
          hbFlag:
            nodeType === EOED_ENodeTye.科室节点 &&
            item?.length >= head?.length + 2 &&
            isMH.hbFlag &&
            item[head?.length + 1] === EOED_EState.异常,
          deviceFullName:
            nodeType === EOED_ENodeTye.设备节点 && item?.length >= head?.length + 1 ? item[head?.length] : '',
        };
        return obj;
      });
    }
  }
}

export interface ItemCode {
  id: number;
  value: string;
  name: string;
  percent: number;
  hasChild: boolean;
  departmentValue: string;
  departmentPercent: number;
}
export interface PieParams {
  endTime: string;
  energyCode: string;
  startTime: string;
  treeId: number;
  hospitalCodeList: string[];
  wholeHospitalFlag: boolean;
}

export interface PieResVO {
  currentTotalEnergyValue: number;
  nodeType: string;
  pieChart: { pieChartSeriesList: pieList[]; yaxisItemList: { title: string; unit: string }[] };
  tableData: string[][];
  tableHead: string[];
  /**
   * 环比时间
   */
  lastMonthDate: string;
  /**
   * 同比时间
   */
  lastYearDate: string;
  treeName: string;
}

export interface pieList {
  energyType: string;
  pieChartDataList: ItemCode[];
}
