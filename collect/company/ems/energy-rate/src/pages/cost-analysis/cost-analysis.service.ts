import { FResHandler } from '../../utils/index';
import { Subject, Observable } from 'rxjs';

import { postRequest } from '../../services/request';

import { formatDate } from '../../utils';
import { CA_SB_ISearchForm } from './ca-search-bar/ca-search-bar.api';
import {
  CA_EPath,
  CA_IBarChartDataVO,
  CA_IConvertTableDataVO,
  CA_IPieChartDataVO,
  CA_IProgressDataVO,
  CA_IQueryEnergyCodeCostAnalysisVoRes,
  CA_IQueryParams,
  CA_IQueryTreeCostAnalysisVoRes,
  CA_ITableDataVO,
} from './cost-analysis.api';
import { reactive, ref } from 'vue';
import message from '../../utils/message';

class CostAnalysisService {
  // 导出入参
  private _exportParams$ = new Subject<CA_IQueryParams>();
  // 表格数据
  private _detailTable$ = new Subject<CA_IConvertTableDataVO>();
  // empty
  private _pieEmpty = ref<boolean>(false);
  private _barEmpty = ref<boolean>(false);
  // loading
  private _pieLoading = ref<boolean>(true);
  private _barLoading = ref<boolean>(true);
  // 搜索条件
  private _searchParams = reactive<CA_IQueryParams>({
    startTime: '',
    endTime: '',
    treeIdList: [],
  });
  // 饼图数据
  private _costPieData = reactive<CA_IPieChartDataVO>({
    seriesData: [],
    legendData: [],
  });
  // 柱状图数据
  private _costBarData = reactive<CA_IBarChartDataVO>({
    seriesData: [],
    legendData: [],
    yaxisData: [],
  });
  // 进度条数据
  private _costProgressData = reactive<CA_IProgressDataVO>({
    stripData: [],
    unit: '',
    tenThousandCost: null,
    totalCost: null,
  });
  private _hasMessage: boolean = false;
  public get exportParams$() {
    return this._exportParams$ as unknown as Observable<CA_IQueryParams>;
  }
  public get detailTable$() {
    return this._detailTable$ as unknown as Observable<CA_IConvertTableDataVO>;
  }
  public get pieEmpty(): boolean {
    return this._pieEmpty.value;
  }
  public get barEmpty(): boolean {
    return this._barEmpty.value;
  }
  public get pieLoading(): boolean {
    return this._pieLoading.value;
  }
  public get barLoading(): boolean {
    return this._barLoading.value;
  }
  public get searchParams(): CA_IQueryParams {
    return this._searchParams;
  }
  public get costPieData(): CA_IPieChartDataVO {
    return this._costPieData;
  }
  public get costBarData(): CA_IBarChartDataVO {
    return this._costBarData;
  }
  public get costProgressData(): CA_IProgressDataVO {
    return this._costProgressData;
  }
  /**
   * 对外暴露的查询方法
   * @param params
   */
  public query(params: CA_SB_ISearchForm) {
    this._hasMessage = false;
    const convertParams = this.mapQueryParams(params);
    this._searchParams = convertParams;

    if (!params.date || params.date?.length === 0 || params.treeIdList?.length === 0) {
      this._pieEmpty.value = true;
      this._barEmpty.value = true;

      this._barLoading.value = false;
      this._pieLoading.value = false;

      this._detailTable$.next({
        body: [],
        title: [],
        treeIdList: [],
      });
      return;
    }

    this._exportParams$.next(convertParams);

    this.queryEnergyCost(convertParams);
    this.queryTreeCost(convertParams);
  }
  /**
   * 生成查询入参
   * @param params
   * @returns
   */
  private mapQueryParams(params: CA_SB_ISearchForm): CA_IQueryParams {
    const { treeIdList, date } = params;
    return {
      treeIdList: treeIdList ?? [],
      startTime: date?.[0] ? formatDate(date?.[0], 'yyyy-MM-dd') : '',
      endTime: date?.[1] ? formatDate(date?.[1], 'yyyy-MM-dd') : '',
    };
  }
  /**
   * 查询柱状图与各分类分项总能耗数据
   */
  private async queryEnergyCost(params: CA_IQueryParams) {
    this._barLoading.value = true;
    try {
      const res = await postRequest(CA_EPath.查询柱状图与各分类分项总能耗数据, params);
      const result = FResHandler<CA_IQueryEnergyCodeCostAnalysisVoRes>(res);

      this._costBarData = this.convertBarData(result?.costBarChartDataVO);
      this._costProgressData = this.convertProgressData(result);

      this._barEmpty.value = this._costBarData.seriesData?.length === 0;
    } catch (error) {
      if (!this._hasMessage) {
        this._hasMessage = true;
        if (error && typeof error === 'string' && (!error?.includes('未知原因') || !error?.includes('操作失败'))) {
          message.error(error);
        }
      }
      console.log('%c✨✨查询柱状图&进度条数据Error✨✨', 'font-size: 24px', error);
      this._barEmpty.value = true;
    } finally {
      this._barLoading.value = false;
    }
  }
  /**
   * 查询饼状图与表格数据
   */
  private async queryTreeCost(params: CA_IQueryParams) {
    this._pieLoading.value = true;
    try {
      const res = await postRequest(CA_EPath.查询饼状图与表格数据, params);
      const result = FResHandler<CA_IQueryTreeCostAnalysisVoRes>(res);

      this._costPieData = this.convertPieData(result?.costPieChartDataVO);

      this._detailTable$.next(this.convertTableData(result?.tableDataVO));
      this._pieEmpty.value = this._costPieData.seriesData?.length === 0;
    } catch (error) {
      console.log('%c✨✨查询饼图&表格数据Error✨✨', 'font-size: 24px', error);
      if (!this._hasMessage) {
        this._hasMessage = true;
        if (error && typeof error === 'string' && (!error?.includes('未知原因') || !error?.includes('操作失败'))) {
          message.error(error);
        }
      }
      this._pieEmpty.value = true;
      this._detailTable$.next({ body: [], title: [], treeIdList: [] });
    } finally {
      this._pieLoading.value = false;
      this._exportParams$.next({
        startTime: this._searchParams.startTime,
        endTime: this._searchParams.endTime,
        treeIdList: [],
      });
    }
  }
  /**
   * 处理柱状图数据
   * @param data
   * @returns
   */
  private convertBarData(data: CA_IBarChartDataVO): CA_IBarChartDataVO {
    return {
      legendData: data?.legendData?.map((item) => item) ?? [],
      seriesData:
        data?.seriesData?.map((item, index) => ({
          energyName: this.resetName(item?.energyName, index + 1) ?? '',
          energyCode: item?.energyCode ?? '',
          costList: item?.costList?.map((cItem) => cItem) ?? '',
          tenThousandCostList: item?.tenThousandCostList?.map((tItem) => tItem) ?? '',
          totalCost: item?.totalCost ?? null,
          tenThousandCost: item?.tenThousandCost ?? null,
          unit: item?.unit ?? '',
        })) ?? [],
      yaxisData: data?.yaxisData?.map((item) => item) ?? [],
    };
  }
  /**
   * 处理进度条数据
   * @param data
   * @returns
   */
  private convertProgressData(data: CA_IQueryEnergyCodeCostAnalysisVoRes): CA_IProgressDataVO {
    return {
      totalCost: data?.totalCost ?? null,
      stripData:
        data?.stripData?.map((item, index) => ({
          energyName: this.resetName(item?.energyName, index + 1) ?? '',
          energyCode: item?.energyCode ?? '',
          costList: item?.costList?.map((cItem) => cItem) ?? '',
          tenThousandCostList: item?.tenThousandCostList?.map((tItem) => tItem) ?? '',
          totalCost: item?.totalCost ?? null,
          tenThousandCost: item?.tenThousandCost ?? null,
          unit: item?.unit ?? '',
        })) ?? [],
      unit: data?.unit ?? '',
      tenThousandCost: data?.tenThousandCost ?? null,
    };
  }
  /**
   * 处理饼图数据
   * @param data
   * @returns
   */
  private convertPieData = (data: CA_IPieChartDataVO): CA_IPieChartDataVO => {
    return {
      seriesData:
        data?.seriesData?.map((item, index) => ({
          treeId: item?.treeId ?? null,
          treeName: this.resetName(item?.treeName, index + 1) ?? '',
          energyValue: item?.energyValue ?? null,
          cost: item?.cost ?? null,
          tenThousandCost: item?.tenThousandCost ?? null,
          unit: item?.unit ?? '',
        })) ?? [],
      legendData: data?.legendData?.map((item) => item ?? '')?.filter((item) => item !== '' && item !== null) ?? [],
    };
  };
  /**
   * 处理表格数据
   * @param data
   * @returns
   */
  private convertTableData(data: CA_ITableDataVO): CA_IConvertTableDataVO {
    const list: { [key: string]: string }[] = [];
    data?.body?.forEach((item) => {
      let obj = {
        sort: item?.[0],
        analysisObj: item?.[1],
        totalCost: item?.[2],
      };
      data?.title?.forEach((tItem, tIndex) => {
        obj = {
          ...obj,
          [tItem]: item[tIndex + 3],
        };
      });
      list.push(obj);
    });
    return {
      body: list,
      title: data?.title?.map((item) => item) ?? [],
      treeIdList: data?.treeIdList?.map((item) => item) ?? [],
    };
  }
  /**
   * 重置name 为name后面添加后缀避免出现同样的name
   * @param count 次数
   * @param name
   * @returns
   */
  private resetName(name: string, count: number) {
    let resetName = name;
    for (let i = 0; i < count; i++) {
      resetName += '\uFEFF';
    }
    return resetName;
  }
}

export default new CostAnalysisService();
