import { postRequest } from '@/services/request';
import { ref, reactive } from 'vue';
import { getCampusParams } from '@/utils/token';
import { EOEA_IBarChatRes } from './ea-office-energy-analysis.api';

const enum PATH {
  能耗数据 = '/energyAnalyse/queryDepartmentEnergyLineChart',
}

export class EnergyBarService {
  public tableParams: TableParams = {
    endTime: '',
    energyCode: '',
    startTime: '',
    treeId: 0,
    hospitalCodeList: [],
    wholeHospitalFlag: true,
  };
  // 柱状图数据
  barData = reactive<EOEA_IBarChatRes>({
    xaxisTimes: [],
    yaxisItemList: [],
    lineChartSeriesList: [],
    colorDescList: [],
    colorList: [],
    lastMonth: true,
    lastYear: true,
  });
  // 同比数据
  lastYearValueList = ref<{ name: string; value: number | null }[]>([]);
  // 环比数据
  lastMonthValueList = ref<{ name: string; value: number | null }[]>([]);
  // loading
  private _loading = ref(true);

  public get loading() {
    return this._loading.value;
  }

  async query(): Promise<boolean> {
    return new Promise(async (resolve) => {
      this._loading.value = true;
      try {
        this.tableParams = {
          ...this.tableParams,
          ...getCampusParams(),
        };
        const res: HttpRequestModule.ResTemplate<EOEA_IBarChatRes> = await postRequest(PATH.能耗数据, this.tableParams);
        if (res?.code === 200) {
          this.barData.colorList = res.data?.colorList ?? [];
          this.barData.colorDescList = res.data?.colorDescList ?? [];
          this.barData.lineChartSeriesList = res.data?.lineChartSeriesList ?? [];
          this.barData.xaxisTimes = res.data?.xaxisTimes ?? [];
          this.barData.yaxisItemList = res.data?.yaxisItemList ?? [];

          const energyType = res?.data?.lineChartSeriesList?.[0]?.energyType;

          // 同环比
          this.lastMonthValueList.value =
            res.data?.lineChartSeriesList?.[0]?.lineChartDataList?.map((item) => ({
              name: `环比${energyType}`,
              value: item.lastMonthValue,
            })) ?? [];
          this.lastYearValueList.value =
            res.data?.lineChartSeriesList?.[0]?.lineChartDataList?.map((item) => ({
              name: `同比${energyType}`,
              value: item.lastYearValue,
            })) ?? [];

          if (this.barData.lineChartSeriesList.length === 0) {
            resolve(false);
          } else {
            resolve(true);
          }
        } else {
          resolve(false);
        }
      } catch (error) {
        console.log(error);
        resolve(false);
      } finally {
        this._loading.value = false;
      }
    });
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

interface ChartData {
  energyType: string;
  lineChartDataList: { name: string; value: number }[];
}

export interface CommonObject {
  [key: string]: string;
}
