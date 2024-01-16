import { formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FConvertToDate } from 'src/app/core/communication/communication.api';
import { CommunicationService } from 'src/app/core/communication/communication.service';
import {
  ACC_EStrategyState,
  ACC_ICardItem,
  ACC_IChartItem,
  ACC_IEfficiencyRatio,
  ACC_IMonthChart,
  ACC_IOverviewItem,
  ACC_IStrategyItem,
  ACC_IStrategyProcessItem,
  ACC_ISystemItem,
} from '../air-conditioner-control.api';
import { AirConditionerControlDatabaseService } from './air-conditioner-control-database.service';
import { AirConditionerControlServiceModule } from './air-conditioner-control.service.module';

const PATH = {
  系统列表: '/energy/ems-api/freezingStation/queryFreezingStationList',
  模式名称: '/energy/ems-api/airConditionControl/queryAirConRunModeName',
  参数运行数据卡片: '/energy/ems-api/airConditionControl/queryParamCards',
  主机负载率卡片: '/energy/ems-api/airConditionControl/queryHostLoadRateCard',
  参数运行数据曲线:
    '/energy/ems-api/airConditionControl/queryMonthlyParamCardAnalysisCharts',
  主机负载率曲线:
    '/energy/ems-api/airConditionControl/queryMonthlyHostAnalysisCharts',
  节能信息: '/energy/ems-api/airConditionControl/queryEnergySavingInfo',
  负荷预测曲线图:
    '/energy/ems-api/airConditionControl/queryLoadForecastingAnalysisCharts',
  节能量统计柱状图:
    '/energy/ems-api/airConditionControl/queryEnergySavingAnalysisBars',
  今日策略:
    '/energy/ems-api/airConditionControl/queryTodayOptimizationStrategy',
  更多策略: '/energy/ems-api/airConditionControl/queryMoreOptimizationStrategy',
  策略执行进度: '/energy/ems-api/airConditionControl/queryStrategyProcess',
};

@Injectable({
  providedIn: AirConditionerControlServiceModule,
})
export class AirConditionerControlCommunicationService extends CommunicationService {
  constructor(
    @Inject(LOCALE_ID) private locale: string,
    protected http: HttpClient,
    private nzMessage: NzMessageService,
    private sDatabase: AirConditionerControlDatabaseService
  ) {
    super();
  }

  public querySystemList(): void {
    const converter = (data: IResSystemListItem[]): ACC_ISystemItem[] =>
      data?.map?.((item) => ({ id: item.id, name: item.name }));

    this.query(
      { $: this.sDatabase.refSystemList$, converter },
      { url: PATH.系统列表 }
    );
  }

  public queryModeName(): void {
    const converter = (data: string): string => data;

    this.query(
      { $: this.sDatabase.refModeName$, converter },
      { url: PATH.模式名称 }
    );
  }

  public queryParamCardList(): void {
    const body: number = this.sDatabase.dataQuery.system;
    const converter = (
      data: IResParamCardList
    ): {
      ratio: ACC_IEfficiencyRatio;
      temperature: ACC_ICardItem;
      load: ACC_ICardItem;
    } =>
      data
        ? {
            ratio: {
              name: data.eer?.paramName,
              code: data.eer?.serialNumber,
              value: data.eer?.value,
              unit: data.eer?.unit,
              rank: data.eer?.score,
              thresholds: [
                +data.eer?.secondaryBadThreshold,
                +data.eer?.goodSecondaryThreshold,
                +data.eer?.excellentGoodThreshold,
              ],
            },
            temperature: {
              name: data.coldWaterTemperature?.paramName,
              code: data.coldWaterTemperature?.serialNumber,
              value: data.coldWaterTemperature?.value,
              unit: data.coldWaterTemperature?.unit,
            },
            load: {
              name: data.unitAreaCoolingLoad?.paramName,
              code: data.unitAreaCoolingLoad?.serialNumber,
              value: data.unitAreaCoolingLoad?.value,
              unit: data.unitAreaCoolingLoad?.unit,
            },
          }
        : null;

    this.query(
      { $: this.sDatabase.refParamCardList$, converter },
      { url: PATH.参数运行数据卡片, body }
    );
  }

  public queryLoadRateCard(): void {
    const body: number = this.sDatabase.dataQuery.system;
    const converter = (
      data: IResLoadRateCard
    ): { host: ACC_ICardItem; children: ACC_ICardItem[] } =>
      data
        ? {
            host: {
              name: data.paramName,
              code: data.deviceId,
              value: data.value,
              unit: data.unit,
            },
            children: data.waterChillUnit?.map?.((child) => ({
              name: child.paramName,
              code: child.deviceId,
              value: child.value,
              unit: child.unit,
            })),
          }
        : null;

    this.query(
      { $: this.sDatabase.refLoadRateCard$, converter },
      { url: PATH.主机负载率卡片, body }
    );
  }

  public queryParamChart(code: string): void {
    const body: IReqQueryItem = {
      systemId: this.sDatabase.dataQuery.system,
      serialNumber: code,
    };
    const converter = (data: IChartItem): ACC_IMonthChart =>
      data
        ? {
            title: data.title,
            dates: data.xaxisData?.map?.((item) => new Date(item)) ?? [],
            series: {
              name: data.seriesData?.[0]?.name,
              unit: data.yaxisItemVO?.unit,
              data: data.seriesData?.[0]?.data ?? [],
              threshold: data.seriesData?.[0]?.threshold,
            },
          }
        : null;

    this.query(
      { $: this.sDatabase.refMonthChart$, converter },
      { url: PATH.参数运行数据曲线, body }
    );
  }

  public queryLoadRateChart(code: number): void {
    const body: IReqQueryItem = {
      systemId: this.sDatabase.dataQuery.system,
      deviceId: code,
    };
    const converter = (data: IChartItem): ACC_IMonthChart =>
      data
        ? {
            title: data.title,
            dates: data.xaxisData?.map?.((item) => new Date(item)) ?? [],
            series: {
              name: data.seriesData?.[0]?.name,
              unit: data.yaxisItemVO?.unit,
              data: data.seriesData?.[0]?.data ?? [],
            },
          }
        : null;

    this.query(
      { $: this.sDatabase.refMonthChart$, converter },
      { url: PATH.主机负载率曲线, body }
    );
  }

  public queryOverview(): void {
    const body: number = this.sDatabase.dataQuery.system;
    const converter = (data: IResOverview): ACC_IOverviewItem =>
      data
        ? {
            range:
              data.startTime && data.endTime
                ? `${data.startTime}～${data.endTime}`
                : null,
            space: {
              title: data.space?.title,
              value: data.space?.value,
              unit: data.space?.unit,
            },
            cost: {
              title: data.cost?.title,
              value: data.cost?.value,
              unit: data.cost?.unit,
            },
          }
        : null;

    this.query(
      { $: this.sDatabase.refOverview$, converter },
      { url: PATH.节能信息, body }
    );
  }

  public queryPredictChart(): void {
    const body: number = this.sDatabase.dataQuery.system;
    const converter = (data: IChartItem): ACC_IChartItem =>
      data
        ? {
            unit: data.yaxisItemVO?.unit,
            dates: data.xaxisData?.map?.((item) => new Date(item)) ?? [],
            series: data.seriesData?.map((series) => ({
              name: series.name,
              data: series.data ?? [],
              primary: series.primary,
            })),
          }
        : null;

    this.query(
      { $: this.sDatabase.refPredictChart$, converter },
      { url: PATH.负荷预测曲线图, body }
    );
  }

  public queryStatisticsChart(): void {
    const body: number = this.sDatabase.dataQuery.system;
    const converter = (data: IChartItem): ACC_IChartItem =>
      data
        ? {
            unit: data.yaxisItemVO?.unit,
            dates: data.xaxisData?.map?.((item) => new Date(item)) ?? [],
            series: data.seriesData?.map((series) => ({
              name: series.name,
              data: series.data ?? [],
              primary: series.primary,
            })),
          }
        : null;

    this.query(
      { $: this.sDatabase.refStatisticsChart$, converter },
      { url: PATH.节能量统计柱状图, body }
    );
  }

  public queryTodayStrategy(): void {
    const body: number = this.sDatabase.dataQuery.system;
    const converter = (
      data: IResTodayStrategy
    ): { date: Date; list: ACC_IStrategyItem[] } =>
      data
        ? {
            date: FConvertToDate(data.date),
            list: data.strategyDetails?.map?.((strategy) => ({
              id: strategy.strategyId,
              count: strategy.count,
              finished: strategy.finishedCount,
              time: strategy.time,
              type: strategy.type,
              details:
                strategy.executionDetails?.map?.((detail) => ({
                  id: detail.detailId,
                  state: detail.status as ACC_EStrategyState,
                  content: detail.content,
                })) ?? [],
            })),
          }
        : null;

    this.query(
      { $: this.sDatabase.refTodayStrategy$, converter },
      { url: PATH.今日策略, body }
    );
  }

  public queryMoreStrategy(start: Date, end: Date): void {
    const body: IReqMoreStrategy = {
      startTime: formatDate(start, 'yyyy-MM-dd', this.locale),
      endTime: formatDate(end, 'yyyy-MM-dd', this.locale),
      systemId: this.sDatabase.dataQuery.system,
    };
    const converter = (
      data: IResMoreStrategyItem[]
    ): Array<{ date: string; list: ACC_IStrategyItem[] }> =>
      data?.map?.((item) => ({
        date: item.date,
        list:
          item.strategyDetails?.map?.((strategy) => ({
            id: strategy.strategyId,
            count: strategy.count,
            finished: strategy.finishedCount,
            time: strategy.time,
            type: strategy.type,
            details:
              strategy.executionDetails?.map?.((detail) => ({
                id: detail.detailId,
                state: detail.status as ACC_EStrategyState,
                content: detail.content,
              })) ?? [],
          })) ?? [],
      }));
    const onError = (error: string) => {
      if (error && !error?.toLowerCase()?.includes('login')) {
        this.nzMessage.error(`查询失败，${error}`);
      }
    };

    this.query(
      { $: this.sDatabase.refMoreStrategy$, converter },
      { url: PATH.更多策略, body },
      { onError }
    );
  }

  public queryStrategyProcess(id: number): void {
    const body: number = id;
    const converter = (data: IResStrategyProcess): ACC_IStrategyProcessItem =>
      data
        ? {
            id: data.strategyDetailId,
            content: data.content,
            details:
              data.processDetails?.map?.((detail) => ({
                id: detail.processId,
                time: detail.time,
                state: detail.status as ACC_EStrategyState,
              })) ?? [],
          }
        : null;

    this.query(
      { $: this.sDatabase.refStrategyProcess$, converter },
      { url: PATH.策略执行进度, body }
    );
  }
}

interface IResSystemListItem {
  id: number;
  name: string;
}

interface IReqQueryItem {
  systemId: number;
  serialNumber?: string;
  deviceId?: number;
}

interface ICardItem {
  deviceId: number;
  paramName: string;
  serialNumber: string;
  unit: string;
  value: string;
}
interface IResParamCardList {
  coldWaterTemperature: ICardItem;
  eer: {
    excellentGoodThreshold: string;
    goodSecondaryThreshold: string;
    secondaryBadThreshold: string;
    score: number;
  } & ICardItem;
  unitAreaCoolingLoad: ICardItem;
}

interface IResLoadRateCard extends ICardItem {
  waterChillUnit: ICardItem[];
}

interface IChartItem {
  seriesData: Array<{
    data: string[];
    name: string;
    threshold: number;
    primary: boolean;
  }>;
  title: string;
  xaxisData: number[];
  yaxisItemVO: { title: string; unit: string };
}

interface IResOverview {
  endTime: string;
  startTime: string;
  space: { title: string; unit: string; value: string };
  cost: { title: string; unit: string; value: string };
}

interface IStrategyItem {
  count: number;
  executionDetails: Array<{
    content: string;
    detailId: number;
    status: string;
  }>;
  finishedCount: number;
  strategyId: number;
  time: string;
  type: number;
}
interface IResTodayStrategy {
  date: string;
  strategyDetails: IStrategyItem[];
}

interface IReqMoreStrategy {
  endTime: string;
  serialNumber?: string;
  startTime: string;
  systemId: number;
}
interface IResMoreStrategyItem {
  date: string;
  strategyDetails: IStrategyItem[];
}

interface IResStrategyProcess {
  content: string;
  processDetails: Array<{ processId: number; status: string; time: string }>;
  strategyDetailId: number;
}
