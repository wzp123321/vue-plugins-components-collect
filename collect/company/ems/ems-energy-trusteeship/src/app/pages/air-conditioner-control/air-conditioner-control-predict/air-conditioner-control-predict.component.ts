import { formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnDestroy, OnInit, Self } from '@angular/core';
import {
  EChartsOption,
  GridComponentOption,
  LegendComponentOption,
  LineSeriesOption,
  TooltipComponentOption,
  XAXisComponentOption,
  YAXisComponentOption,
} from 'echarts';
import { Subscription } from 'rxjs';
import { CHART_COLOR_OPTIONS, FMixinAlpha } from 'src/app/core/color/color.api';
import { AirConditionerControlPredictService } from './air-conditioner-control-predict.service';

const INTERVAL = 2 * 60 * 60_000;
const CHART_COLOR = 'rgba(0, 178, 97, 1)';
const CHART_COLOR_PRIMARY = 'rgba(54, 129, 255, 1)';
const CHART_ICON_COLOR = 'rgba(1, 172, 94, 1)';
const CHART_ICON_COLOR_PRIMARY = 'rgba(53, 125, 247, 1)';
const CHART_INDICATOR_COLOR = 'rgba(191, 191, 191, 1)';

@Component({
  selector: 'ems-air-conditioner-control-predict',
  templateUrl: './air-conditioner-control-predict.component.html',
  styleUrls: ['./air-conditioner-control-predict.component.less'],
  providers: [AirConditionerControlPredictService],
})
export class AirConditionerControlPredictComponent implements OnInit, OnDestroy {
  public get isLoading(): boolean {
    return this.service.isLoading;
  }

  public get isEmpty(): boolean {
    return this.service.isEmpty;
  }

  public get message(): string {
    return this.service.message;
  }

  public get unit(): string {
    return this.service.unit;
  }

  private _subscriptions: Subscription[] = [];

  public chartOptions: EChartsOption = {};

  constructor(
    @Inject(LOCALE_ID) private locale: string,
    @Self() private service: AirConditionerControlPredictService
  ) {}

  ngOnInit(): void {
    this._subscriptions.push(this.service.onData.subscribe((success) => success && this.initChartOptions()));
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  private initChartOptions(): void {
    this.chartOptions = {
      legend: this.mapChartLegend(),
      grid: this.mapChartGrid(),
      xAxis: this.mapChartXAxis(),
      yAxis: this.mapChartYAxis(),
      tooltip: this.mapChartTooltip(),
      series: this.mapChartSeries(),
    };
  }

  private mapChartLegend(): LegendComponentOption {
    return {
      itemGap: 24,
      itemWidth: 20,
      itemHeight: 2,
      itemStyle: { opacity: 0 },
      inactiveColor: CHART_COLOR_OPTIONS.DISABLE,
      textStyle: { fontSize: 14, lineHeight: 20 },
      data: this.service.series.map((series) => ({
        name: series.name,
        textStyle: { color: series.primary ? CHART_COLOR_PRIMARY : CHART_COLOR },
      })),
    };
  }

  private mapChartGrid(): GridComponentOption {
    return { top: 40, right: 7, bottom: 2, left: 7, containLabel: true };
  }

  private mapChartXAxis(): XAXisComponentOption {
    return {
      type: 'time',
      min: ({ min, max }) => min - 0.3 * INTERVAL,
      max: ({ min, max }) => max + 0.3 * INTERVAL,
      minInterval: INTERVAL,
      axisLine: { lineStyle: { color: CHART_COLOR_OPTIONS.LINE } },
      axisTick: { show: false },
      axisLabel: { margin: 9, formatter: '{HH}:{mm}', color: CHART_COLOR_OPTIONS.TEXT, fontSize: 14, lineHeight: 22 },
      axisPointer: { type: 'line', lineStyle: { color: CHART_INDICATOR_COLOR, width: 0.5, type: 'solid' } },
    };
  }

  private mapChartYAxis(): YAXisComponentOption {
    return {
      type: 'value',
      axisLine: { show: true, lineStyle: { color: CHART_COLOR_OPTIONS.LINE } },
      axisTick: { show: true, length: 3 },
      axisLabel: { margin: 7, color: CHART_COLOR_OPTIONS.TEXT, fontSize: 14, lineHeight: 22 },
      splitLine: { lineStyle: { color: CHART_COLOR_OPTIONS.LINE } },
    };
  }

  private mapChartTooltip(): TooltipComponentOption {
    return {
      show: true,
      trigger: 'axis',
      renderMode: 'html',
      className: 'chart-tooltip-container',
      position: (point, params, dom, rect, size) => [
        +point[0] + size.contentSize[0] + 24 < size.viewSize[0] ? +point[0] + 12 : +point[0] - 12 - size.contentSize[0],
        (size.viewSize[1] - size.contentSize[1] + 22) / 2,
      ],
      formatter: (params) => {
        if (!(params instanceof Array)) {
          params = [params];
        }

        const date = (params[0].value as [Date, number])[0];
        let template = `
          <label>${formatDate(date, 'yyyy-MM-dd HH:mm', this.locale)}</label>
        `;
        params.forEach((param) => {
          const [date, value] = param.value as [Date, number];
          const color = this.service.series.find((series) => series.name === param.seriesName)?.primary
            ? CHART_ICON_COLOR_PRIMARY
            : CHART_ICON_COLOR;
          template += `
            <div class="chart-tooltip-item-container mt8">
              <span style="background-color: ${color}" class="chart-tooltip-item-icon"></span>
              <label>${param.seriesName}：${value ?? '--'}${this.unit ? `(${this.unit})` : ''}</label>
            </div>
          `;
        });

        return template;
      },
      padding: [8, 12],
      extraCssText: 'box-shadow: 0px 10px 32px 0px rgba(38, 38, 38, 0.18)',
    };
  }

  private mapChartSeries(): LineSeriesOption[] {
    return this.service.series.map((series) => {
      const color = series.primary ? CHART_COLOR_PRIMARY : CHART_COLOR;
      return {
        type: 'line',
        symbol: 'circle',
        symbolSize: 18,
        name: series.name,
        itemStyle: { color },
        emphasis: {
          itemStyle: {
            color: {
              type: 'radial',
              x: 0.5,
              y: 0.5,
              r: 0.5,
              colorStops: [
                { offset: 6 / 18, color },
                { offset: 8 / 18, color: 'transparent' },
                { offset: 12 / 18, color: 'transparent' },
                { offset: 14 / 18, color: FMixinAlpha(color, 0.4) },
              ],
            },
          },
        },
        smooth: true,
        data: series.data?.map((v, i, origin) => {
          if (origin[i - 1] != null || origin[i + 1] != null) {
            return { value: [this.service.dates[i], v], itemStyle: { color: 'transparent' } };
          } else {
            return { value: [this.service.dates[i], v] };
          }
        }),
      };
    });
  }
}
