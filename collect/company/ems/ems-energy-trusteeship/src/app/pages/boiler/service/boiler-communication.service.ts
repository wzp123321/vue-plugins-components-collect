import { formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CommunicationService } from 'src/app/core/communication/communication.service';
import {
  B_EEfficiencyRank_Options,
  B_EfficiencyItem,
  B_IAnalysisSource,
  B_IBenchmarkItem,
  B_IEfficiencyNodeItem,
  B_IOptionItem,
  B_IParameterItem,
} from '../boiler.api';
import { BoilerDatabaseService } from './boiler-database.service';
import { BoilerServiceModule } from './boiler.service.module';

const PATH = {
  能效节点下拉选择框: '/energy/ems-api/boiler/queryBoilerList',
  锅炉参数下拉选择框: '/energy/ems-api/boiler/queryMultiSystemSameParamList',
  投入产出效率总览: '/energy/ems-api/boiler/queryEnergyExhibition',
  能效对标: '/energy/ems-api/boiler/queryEnergyBenchmarking',
  参数: '/energy/ems-api/boiler/queryParamSection',
  能效分析: '/energy/ems-api/boiler/queryEnergyEfficiencyAnalysisCharts',
  能效分析导出: '/energy/ems-api/boiler/exportEnergyEfficiencyAnalysisExcel',
};

@Injectable({ providedIn: BoilerServiceModule })
export class BoilerCommunicationService extends CommunicationService {
  constructor(
    @Inject(LOCALE_ID) private locale: string,
    protected http: HttpClient,
    private nzMessage: NzMessageService,
    private sDatabase: BoilerDatabaseService
  ) {
    super();
  }

  public queryEfficiencyNodes(): void {
    const converter = (
      data: IResEfficiencyNodesItem[]
    ): B_IEfficiencyNodeItem[] =>
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
    ): B_IOptionItem<string>[] =>
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
      { url: PATH.锅炉参数下拉选择框, body },
      { onError }
    );
  }

  public queryEfficiencyOverview(): void {
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
    const converter = (data: IResEfficiencyOverview): B_EfficiencyItem =>
      data
        ? {
            cost: data.steamEnergyCost,
            output: data.steamOutput,
            consumption: data.gasConsumption,
          }
        : null;

    this.query(
      { $: this.sDatabase.refEfficiencyValues$, converter },
      { url: PATH.投入产出效率总览, body }
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
    ): { standards: B_IBenchmarkItem[]; current: B_IBenchmarkItem } =>
      data
        ? {
            standards:
              data.energyEfficiencyLevels?.map((v) => ({
                level: v.level,
                value: v.text,
              })) ??
              B_EEfficiencyRank_Options.map((option) => ({
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
    const converter = (data: IResParameter): B_IParameterItem[] =>
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
    ): { param: string; list: B_IParameterItem[] } =>
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
    const converter = (data: IResEfficiencyAnalysis): B_IAnalysisSource =>
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

interface IResEfficiencyOverview {
  steamEnergyCost: string;
  steamOutput: string;
  gasConsumption: string;
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
