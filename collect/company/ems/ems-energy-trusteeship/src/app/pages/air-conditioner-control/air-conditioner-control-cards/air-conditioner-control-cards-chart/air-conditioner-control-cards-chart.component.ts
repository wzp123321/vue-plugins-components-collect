import { formatDate } from '@angular/common';
import { Component, EventEmitter, Inject, Input, LOCALE_ID, OnDestroy, OnInit, Output, Self } from '@angular/core';
import {
  EChartsOption,
  GridComponentOption,
  LineSeriesOption,
  TooltipComponentOption,
  XAXisComponentOption,
  YAXisComponentOption,
} from 'echarts';
import { Subscription } from 'rxjs';
import { CHART_COLOR_OPTIONS, FMixinAlpha } from 'src/app/core/color/color.api';
import { AirConditionerControlCardsChartService } from './air-conditioner-control-cards-chart.service';

const INTERVAL = 24 * 60 * 60_000;
const CHART_COLOR = 'rgba(0, 178, 97, 1)';
const CHART_COLOR_PRIMARY = 'rgba(22, 144, 255, 1)';

@Component({
  selector: 'ems-air-conditioner-control-cards-chart',
  templateUrl: './air-conditioner-control-cards-chart.component.html',
  styleUrls: ['./air-conditioner-control-cards-chart.component.less'],
  providers: [AirConditionerControlCardsChartService],
})
export class AirConditionerControlCardsChartComponent implements OnInit, OnDestroy {
  @Input()
  public anchor: [number, number] = [0, 0];

  @Input()
  public primary = false;

  @Input()
  public code: string;

  @Output()
  public onCloseClick = new EventEmitter<void>();

  public get isLoading(): boolean {
    return this.service.isLoading;
  }

  public get title(): string {
    return this.service.title;
  }

  private _subscriptions: Subscription[] = [];

  private _min = 0;
  private _max = 0;

  public chartOptions: EChartsOption = {};

  constructor(
    @Inject(LOCALE_ID) private locale: string,
    @Self() private service: AirConditionerControlCardsChartService
  ) {}

  ngOnInit(): void {
    this._subscriptions.push(this.service.onData.subscribe((success) => success && this.initChartOptions()));

    this.service.doRetrieve(this.code);
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  public dismiss(): void {
    this.onCloseClick.emit();
  }

  private initChartOptions(): void {
    const temp = [...this.service.series.data].sort((a, b) => +a - +b);
    this._min = +temp[0];
    this._max = Math.max(+temp.pop(), this.service.series.threshold);

    this.chartOptions = {
      grid: this.mapChartGrid(),
      xAxis: this.mapChartXAxis(),
      yAxis: this.mapChartYAxis(),
      tooltip: this.mapChartTooltip(),
      series: this.mapChartSeries(),
    };
  }

  private mapChartGrid(): GridComponentOption {
    return { top: 28, right: 20, bottom: 30, left: 52, containLabel: false };
  }

  private mapChartXAxis(): XAXisComponentOption {
    return {
      type: 'time',
      min: 'dataMin',
      max: 'dataMax',
      minInterval: INTERVAL,
      axisLine: { lineStyle: { color: CHART_COLOR_OPTIONS.LINE } },
      axisTick: { show: false },
      axisLabel: {
        margin: 7,
        formatter: (v: number) =>
          v === +this.service.dates[0] || v === +this.service.dates.slice(-1)[0] ? '{M}.{d}' : null,
        showMinLabel: true,
        showMaxLabel: true,
        color: CHART_COLOR_OPTIONS.TEXT,
        fontSize: 14,
        lineHeight: 22,
      },
      axisPointer: {
        type: 'line',
        label: {
          show: true,
          formatter: (params) => formatDate(params.value, 'M.d', this.locale),
          margin: 7,
          color: 'white',
          fontSize: 14,
          lineHeight: 22,
          height: 20,
          padding: [0, 8],
          backgroundColor: this.primary ? CHART_COLOR_PRIMARY : CHART_COLOR,
        },
        lineStyle: {
          color: this.primary ? CHART_COLOR_PRIMARY : CHART_COLOR,
          width: 0.5,
          type: 'solid',
        },
      },
    };
  }

  private mapChartYAxis(): YAXisComponentOption {
    return { show: false, type: 'value', min: this._min, max: this._max };
  }

  private mapChartTooltip(): TooltipComponentOption {
    const color = this.primary ? CHART_COLOR_PRIMARY : CHART_COLOR;
    return {
      show: true,
      trigger: 'axis',
      renderMode: 'html',
      position: (point, params, dom, rect, size) => {
        if (!(params instanceof Array)) {
          params = [params];
        }

        const value = (params[0]?.value as [Date, string])?.[1];
        const bottom = +value
          ? isNaN(+value / (this._max - this._min))
            ? size.viewSize[1] - 28
            : (+value / (this._max - this._min)) * (size.viewSize[1] - 58) + 45
          : 45;

        const half = size.contentSize[0] / 2;
        if (point[0] - half < 4) {
          return { left: point[0] + 4, bottom };
        } else if (point[0] + half + 4 > size.viewSize[0]) {
          return { right: size.viewSize[0] - point[0] - 4, bottom };
        } else {
          return { left: point[0] - half, bottom };
        }
      },
      formatter: (params) => {
        if (!(params instanceof Array)) {
          params = [params];
        }

        if (!params.length) {
          return null;
        }

        const [date, value] = params[0].value as [Date, string];
        return value == null ? null : `${value}${this.service.series.unit}`;
      },
      backgroundColor: color,
      borderColor: color,
      padding: [0, 10],
      textStyle: { color: 'white', fontSize: 14, lineHeight: 20 },
      extraCssText: `box-shadow: 0px 4px 8px 0px ${FMixinAlpha(color, 0.5)}`,
    };
  }

  private mapChartSeries(): LineSeriesOption {
    const color = this.primary ? CHART_COLOR_PRIMARY : CHART_COLOR;
    return {
      type: 'line',
      symbol: 'circle',
      symbolSize: 18,
      itemStyle: { color },
      lineStyle: { shadowBlur: 8, shadowColor: FMixinAlpha(color, 0.5), shadowOffsetY: 4 },
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
      data: this.service.series.data?.map((v, i, origin) => {
        if (origin[i - 1] != null || origin[i + 1] != null) {
          return { value: [this.service.dates[i], v], itemStyle: { color: 'transparent' } };
        } else {
          return { value: [this.service.dates[i], v] };
        }
      }),
      markLine: this.service.series.threshold
        ? {
            silent: true,
            symbol: 'none',
            label: {
              position: 'start',
              distance: 8,
              formatter: (params) => [`{name|${params.name}}`, `{value|${params.value}}`].join('\n'),
              color: CHART_COLOR_PRIMARY,
              rich: {
                name: { fontSize: 12, lineHeight: 20 },
                value: { fontSize: 14, lineHeight: 22 },
              },
            },
            lineStyle: { color: CHART_COLOR_PRIMARY, width: 2, type: 'dashed' },
            data: [{ name: '优值', yAxis: this.service.series.threshold }],
          }
        : null,
    };
  }
}
