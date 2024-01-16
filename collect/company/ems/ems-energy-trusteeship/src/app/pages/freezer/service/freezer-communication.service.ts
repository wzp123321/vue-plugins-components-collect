import { formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CommunicationService } from 'src/app/core/communication/communication.service';
import {
  F_EEfficiencyRank_Options,
  F_IAnalysisSource,
  F_IBenchmarkItem,
  F_IEfficiencyNodeItem,
  F_IOptionItem,
  F_IParameterItem,
  F_IPowerItem,
} from '../freezer.api';
import { FreezerDatabaseService } from './freezer-database.service';
import { FreezerServiceModule } from './freezer.service.module';

const PATH = {
  能效节点下拉选择框:
    '/energy/ems-api/freezingStation/queryFreezingStationList',
  冷冻站参数下拉选择框:
    '/energy/ems-api/freezingStation/queryMultiSystemSameParamList',
  能耗总览: '/energy/ems-api/freezingStation/queryEnergyExhibition',
  能效对标: '/energy/ems-api/freezingStation/queryEnergyBenchmarking',
  参数: '/energy/ems-api/freezingStation/queryParamSection',
  能效分析:
    '/energy/ems-api/freezingStation/queryEnergyEfficiencyAnalysisCharts',
  能效分析导出:
    '/energy/ems-api/freezingStation/exportEnergyEfficiencyAnalysisExcel',
};

@Injectable({ providedIn: FreezerServiceModule })
export class FreezerCommunicationService extends CommunicationService {
  constructor(
    @Inject(LOCALE_ID) private locale: string,
    protected http: HttpClient,
    private nzMessage: NzMessageService,
    private sDatabase: FreezerDatabaseService
  ) {
    super();
  }

  public queryEfficiencyNodes(): void {
    const converter = (
      data: IResEfficiencyNodesItem[]
    ): F_IEfficiencyNodeItem[] =>
      data?.map((item) => ({ id: item.id, name: item.name }));

    this.query(
      { $: this.sDatabase.refEfficiencyNodes$, converter },
      { url: PATH.能效节点下拉选择框 }
    );
  }

  public queryParameterList(): void {
    const body: number[] = this.sDatabase.dataQuery.nodes;
    const converter = (
      data: IResParameterListItem[]
    ): F_IOptionItem<string>[] =>
      data?.map((item) => ({
        label: item.paramName,
        value: item.serialNumber,
      }));
    const onError = () => {
      this.sDatabase.refAnalysisValues$.next(null);
      this.sDatabase.refParameterRank$.next(null);
    };

    this.query(
      { $: this.sDatabase.refParameterTypes$, converter },
      { url: PATH.冷冻站参数下拉选择框, body },
      { onError }
    );
  }

  public queryConsumptionOverview(): void {
    const body: IReqQuery = {
      systemIds: this.sDatabase.dataQuery.nodes,
      startTime: formatDate(
        this.sDatabase.dataQuery.begin,
        'yyyy-MM-dd',
        this.locale
      ),
      endTime: formatDate(
        this.sDatabase.dataQuery.end,
        'yyyy-MM-dd',
        this.locale
      ),
    };
    const converter = (data: IResConsumptionOverview): F_IPowerItem =>
      data
        ? { average: data.avgVal, min: data.minVal, max: data.maxVal }
        : null;

    this.query(
      { $: this.sDatabase.refPowerValues$, converter },
      { url: PATH.能耗总览, body }
    );
  }

  public queryEfficiencyBenchmark(): void {
    const body: IReqQuery = {
      systemIds: this.sDatabase.dataQuery.nodes,
      startTime: formatDate(
        this.sDatabase.dataQuery.begin,
        'yyyy-MM-dd',
        this.locale
      ),
      endTime: formatDate(
        this.sDatabase.dataQuery.end,
        'yyyy-MM-dd',
        this.locale
      ),
    };
    const converter = (
      data: IResEfficiencyBenchmark
    ): { standards: F_IBenchmarkItem[]; current: F_IBenchmarkItem } =>
      data
        ? {
            standards:
              data.energyEfficiencyLevels?.map((v) => ({
                level: v.level,
                value: v.text,
              })) ??
              F_EEfficiencyRank_Options.map((option) => ({
                level: option.value,
              })),
            current: {
              level: data.currentLevel,
              value: data.currentValue?.toString(),
            },
          }
        : null;

    this.query(
      { $: this.sDatabase.refBenchmarkValues$, converter },
      { url: PATH.能效对标, body }
    );
  }

  public queryParameterLevel(): void {
    const body: IReqQuery = {
      systemIds: this.sDatabase.dataQuery.nodes,
      startTime: formatDate(
        this.sDatabase.dataQuery.begin,
        'yyyy-MM-dd',
        this.locale
      ),
      endTime: formatDate(
        this.sDatabase.dataQuery.end,
        'yyyy-MM-dd',
        this.locale
      ),
    };
    const converter = (data: IResParameter): F_IParameterItem[] =>
      data
        ? data.table.map((v) => ({
            name: v.paramName,
            average: v.avgVal,
            min: v.lower,
            max: v.upper,
          }))
        : null;

    this.query(
      { $: this.sDatabase.refParameterList$, converter },
      { url: PATH.参数, body }
    );
  }

  public queryParameterRank(param: string): void {
    const body: IReqQuery = {
      systemIds: this.sDatabase.dataQuery.nodes,
      startTime: formatDate(
        this.sDatabase.dataQuery.begin,
        'yyyy-MM-dd',
        this.locale
      ),
      endTime: formatDate(
        this.sDatabase.dataQuery.end,
        'yyyy-MM-dd',
        this.locale
      ),
      serialNumber: param,
    };
    const converter = (
      data: IResParameter
    ): { param: string; list: F_IParameterItem[] } =>
      data
        ? {
            param: data.title,
            list: data.table.map((v) => ({
              name: v.paramName,
              average: v.avgVal,
              min: v.lower,
              max: v.upper,
            })),
          }
        : null;

    this.query(
      { $: this.sDatabase.refParameterRank$, converter },
      { url: PATH.参数, body }
    );
  }

  public queryEfficiencyAnalysis(param?: string): void {
    const body: IReqQuery = {
      systemIds: this.sDatabase.dataQuery.nodes,
      startTime: formatDate(
        this.sDatabase.dataQuery.begin,
        'yyyy-MM-dd',
        this.locale
      ),
      endTime: formatDate(
        this.sDatabase.dataQuery.end,
        'yyyy-MM-dd',
        this.locale
      ),
      serialNumber: param,
    };
    const converter = (data: IResEfficiencyAnalysis): F_IAnalysisSource =>
      data
        ? {
            dates: data.xaxisData?.map((v) => new Date(v)),
            series: data.seriesData?.map((item) => ({
              name: item.name,
              data: item.data.map((v) => v?.toString()),
              unit: item.unit,
            })),
          }
        : null;

    this.query(
      { $: this.sDatabase.refAnalysisValues$, converter },
      { url: PATH.能效分析, body }
    );
  }

  public exportEfficiencyAnalysis(param?: string): void {
    const body: IReqQuery = {
      systemIds: this.sDatabase.dataQuery.nodes,
      startTime: formatDate(
        this.sDatabase.dataQuery.begin,
        'yyyy-MM-dd',
        this.locale
      ),
      endTime: formatDate(
        this.sDatabase.dataQuery.end,
        'yyyy-MM-dd',
        this.locale
      ),
      serialNumber: param,
    };
    const onSuccess = () => this.nzMessage.success('导出成功');
    const onError = (error: string) => {
      if (error && !error?.toLowerCase()?.includes('login')) {
        this.nzMessage.error(`导出失败，${error}`);
      }
    };

    this.download(
      { $: this.sDatabase.refAnalysisExport$, name: '能效分析.xlsx' },
      { url: PATH.能效分析导出, body },
      { onSuccess, onError }
    );
  }
}

interface IReqQuery {
  endTime: string;
  serialNumber?: string;
  startTime: string;
  systemIds: number[];
}

interface IResEfficiencyNodesItem {
  id: number;
  name: string;
}

interface IResParameterListItem {
  paramName: string;
  serialNumber: string;
  unit: string;
}

interface IResConsumptionOverview {
  avgVal: string;
  maxVal: string;
  minVal: string;
}

interface IResEfficiencyBenchmark {
  currentLevel: number;
  currentValue: number;
  energyEfficiencyLevels: { level: number; text: string }[];
}

interface IResParameter {
  title: string;
  table: { avgVal: string; lower: string; paramName: string; upper: string }[];
}

interface IResEfficiencyAnalysis {
  seriesData: { data: number[]; name: string; unit: string }[];
  xaxisData: number[];
}
