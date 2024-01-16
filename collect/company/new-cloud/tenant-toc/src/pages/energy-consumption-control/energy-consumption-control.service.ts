import { ref } from 'vue';
import { Subject, Observable } from 'rxjs';

import { postRequest } from '@/service/request';
import { EccIDateScopeVO, EccSbEPeriodType, Ecc_ISearchForm } from './components/ecc-search-bar/ecc-search-bar.api';
import { CommonIHttpRes } from '../../service/api/index';
import {
  ECC_IEnergyControlVO,
  ECC_IEnergyDataVO,
  ECC_IChartVO,
  ECC_IPriceDataVO,
  ECC_IQueryParams,
  ECC_IDataVO,
  ECC_IPriceVO,
  ECC_ISavingVO,
  Ecc_ISavingCardDataVO,
} from './energy-consumption-control.api';

import { floatMultiply, formatDate, getTenant } from '@/utils/index';
import { endOfMonth, endOfYear, isThisMonth, isThisYear, startOfMonth, startOfYear } from 'date-fns';
import message from '@/utils/message';

enum EPath {
  查询能耗管控信息 = '/energyControl/queryEnergyControlVO',
}

interface EnergyControlRes {
  energyDataVO: ECC_IEnergyDataVO;
  energyChartList: ECC_IChartVO[];
  priceDataVO: ECC_IPriceDataVO;
  priceChartList: ECC_IChartVO[];
  savingDataVO: Ecc_ISavingCardDataVO;
  savingChartList: ECC_IChartVO[];
}

// 基础服务
class EccDataBaseService {
  private _dateScopeResult$ = new Subject<string>();
  private _energyControlResult$ = new Subject<EnergyControlRes>();
  public get dateScopeResult$() {
    return this._dateScopeResult$ as unknown as Observable<string>;
  }
  public get energyControlResult$() {
    return this._energyControlResult$ as unknown as Observable<EnergyControlRes>;
  }
  private _loading = ref<boolean>(true);
  private _searchForm = ref<ECC_IQueryParams>({
    energyCode: '',
    hostingAreaId: null,
    hostingPeriodIndex: null,
    startTimeStr: '',
    endTimeStr: '',
    periodType: '',
  });
  public get loading(): boolean {
    return this._loading.value;
  }
  public get searchForm(): Ecc_ISearchForm {
    return this._searchForm.value as Ecc_ISearchForm;
  }
  /**
   * 查询
   * @param params 表单数据
   */
  public async query(params: Ecc_ISearchForm, lastTimeStamp: EccIDateScopeVO, clickTriggerFlag: boolean = true) {
    this._loading.value = true;
    if (!params.energyCode) {
      if (clickTriggerFlag) {
        message.error('能源类型不能为空');
      }
      this.mapSubscribeResult('', null, null, null);
      this._loading.value = false;
      return;
    }
    if (
      (params.periodType === EccSbEPeriodType.按托管期 && !params.hostingPeriodIndex) ||
      ((params.periodType === EccSbEPeriodType.按年 || params.periodType === EccSbEPeriodType.按月) &&
        !params.yearMonthStr?.length)
    ) {
      this.mapSubscribeResult('', null, null, null);
      if (clickTriggerFlag) {
        message.error('日期不能为空');
      }
      this._loading.value = false;
      return;
    }

    const { energyCode, periodType, hostingAreaId, hostingPeriodIndex, yearMonthStr } = params;
    const { startTimeStr, endTimeStr } = this.mapQueryTime(yearMonthStr ?? [], periodType, lastTimeStamp);
    this._searchForm.value = {
      ...this._searchForm.value,
      energyCode,
      periodType,
      hostingAreaId: hostingAreaId === '' ? null : Number(hostingAreaId),
      hostingPeriodIndex,
      startTimeStr,
      endTimeStr,
      ...getTenant(),
    };
    try {
      const queryParams = {
        energyCode,
        hostingAreaId,
        startTimeStr,
        endTimeStr,
        ...getTenant(),
      };
      const res: CommonIHttpRes<ECC_IEnergyControlVO> = await postRequest(EPath.查询能耗管控信息, queryParams);
      if (res?.success) {
        const { timeStr, priceVO, dataVO, controlSavingVO } = res.data;
        this.mapSubscribeResult(timeStr, priceVO, dataVO, controlSavingVO);
      }
    } catch (error) {
    } finally {
      this._loading.value = false;
    }
  }
  private mapQueryTime(yearMonthStr: Date[], periodType: string, lastTimeStamp: EccIDateScopeVO) {
    let startTimeStr = '';
    let endTimeStr = '';
    if (yearMonthStr?.length === 2) {
      // 如果是按托管期
      if (periodType === EccSbEPeriodType.按托管期) {
        startTimeStr = formatDate(yearMonthStr?.[0], 'yyyy-MM');
        endTimeStr = formatDate(
          new Date(Math.min(yearMonthStr?.[1].getTime(), lastTimeStamp.endTimeMillis as number)),
          'yyyy-MM',
        );
      } else {
        if (periodType === EccSbEPeriodType.按年) {
          startTimeStr = formatDate(startOfYear(yearMonthStr?.[0]), 'yyyy-MM');
        } else {
          startTimeStr = formatDate(startOfMonth(yearMonthStr?.[0]), 'yyyy-MM');
        }

        if (
          (periodType === EccSbEPeriodType.按年 && isThisYear(yearMonthStr?.[1])) ||
          (periodType === EccSbEPeriodType.按月 && isThisYear(yearMonthStr?.[1]) && isThisMonth(yearMonthStr?.[1]))
        ) {
          endTimeStr = formatDate(
            new Date(Math.min(new Date().getTime(), lastTimeStamp.endTimeMillis ?? 0)),
            'yyyy-MM',
          );
        } else {
          endTimeStr = formatDate(
            periodType === EccSbEPeriodType.按年 ? endOfYear(yearMonthStr?.[1]) : endOfMonth(yearMonthStr?.[1]),
            'yyyy-MM',
          );
        }
      }
    } else {
      startTimeStr = '';
      endTimeStr = '';
    }

    return {
      startTimeStr,
      endTimeStr,
    };
  }
  mapSubscribeResult(
    timeStr: string,
    priceVO: ECC_IPriceVO | null,
    dataVO: ECC_IDataVO | null,
    controlSavingVO: ECC_ISavingVO | null,
  ) {
    this._dateScopeResult$.next(timeStr ?? '');
    this._energyControlResult$.next({
      energyDataVO: {
        unit: dataVO?.unit ?? '',
        actualDiffRatio: dataVO?.actualDiffRatio ?? '',
        actualDiffValue: dataVO?.actualDiffValue ?? null,
        actualValue: dataVO?.actualValue ?? null,
        yearOnYearDiffRatio: dataVO?.yearOnYearDiffRatio ?? '',
        yearOnYearDiffValue: dataVO?.yearOnYearDiffValue ?? null,
        yearOnYearValue: dataVO?.yearOnYearValue ?? null,
        budgetDiffRatio: dataVO?.budgetDiffRatio ?? '',
        budgetDiffValue: dataVO?.budgetDiffValue ?? null,
        budgetValue: dataVO?.budgetValue ?? null,
      },
      energyChartList: dataVO?.chartVOList ?? [],
      priceDataVO: {
        unit: priceVO?.unit ?? '',
        comprehensivePrice: priceVO?.comprehensivePrice ?? null,
        contractPrice: priceVO?.contractPrice ?? null,
      },
      priceChartList: priceVO?.chartVOList ?? [
        {
          typeName: '合同单价',
          unit: '',
          xaxis: [],
          dataList: [],
        },
        {
          typeName: '综合单价',
          unit: '',
          xaxis: [],
          dataList: [],
        },
      ],
      savingDataVO: {
        manageSavingRatio: controlSavingVO?.manageSavingRatio ?? '',
        technicalSavingRatio: controlSavingVO?.technicalSavingRatio ?? '',
      },
      savingChartList:
        controlSavingVO?.chartVOList?.map((item) => ({
          typeName: item?.typeName ?? '',
          unit: '%' ?? '',
          xaxis: item?.xaxis ?? '',
          dataList: item?.dataList?.map((cItem) => (cItem === null ? null : floatMultiply(cItem, 100))) ?? '',
        })) ?? [],
    });
  }
}

export default new EccDataBaseService();
