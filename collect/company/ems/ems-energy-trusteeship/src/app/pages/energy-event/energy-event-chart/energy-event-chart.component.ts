import { formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnDestroy, OnInit, Self } from '@angular/core';
import {
  ECharts,
  EChartsOption,
  LineSeriesOption,
  SliderDataZoomComponentOption,
  TooltipComponentOption,
} from 'echarts';
import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { NumberSeparatorPipe } from 'src/app/common/pipes/number-separator/number-separator.pipe';
import { EE_EEventType, EE_EEventType_Options, EE_IChartEventItem } from '../energy-event.api';
import { EnergyEventChartService } from './energy-event-chart.service';

const CHART_OPTIONS = {
  TIME_SPAN: 24 * 60 * 60 * 1000,
  COLOR: { TEXT: 'rgba(0, 0, 0, 0.65)', LINE: 'rgba(0, 0, 0, 0.15)' },
  FONT: { LINE_HEIGHT: 22, SIZE: 14, WEIGHT: 400 },
};

@Component({
  selector: 'ems-energy-event-chart',
  templateUrl: './energy-event-chart.component.html',
  styleUrls: ['./energy-event-chart.component.less'],
  providers: [EnergyEventChartService, NumberSeparatorPipe],
})
export class EnergyEventChartComponent implements OnInit, OnDestroy {
  public get isLoading(): boolean {
    return this.service.isLoading;
  }

  public get unit(): string {
    return this.service.unit;
  }

  public get typeOptions(): { label: string; value: EE_EEventType; color: string }[] {
    return EE_EEventType_Options;
  }

  public chartOptions: EChartsOption = {};

  private _subscriptions: Subscription[] = [];
  private _chart$ = new BehaviorSubject<ECharts>(null);

  constructor(
    @Inject(LOCALE_ID) private locale: string,
    @Self() private service: EnergyEventChartService,
    @Self() private pNumberSeparator: NumberSeparatorPipe
  ) {}

  ngOnInit(): void {
    this._subscriptions.push(
      combineLatest([this._chart$, this.service.onDataLoad]).subscribe(([chart, success]) => {
        if (chart) {
          if (success) {
            this.chartOptions.dataZoom = this.getChartZoom();
            this.chartOptions.tooltip = this.getChartTooltip();
            this.chartOptions.series = this.getChartSeries();
            this._chart$.value?.setOption(this.chartOptions);
          } else {
            this.chartOptions.dataZoom = {};
            this.chartOptions.tooltip = {};
            this.chartOptions.series = {};
            this._chart$.value?.setOption(this.chartOptions);
          }
        }
      })
    );

    this.initChart();
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach((subscription) => subscription.unsubscribe());
    this._chart$.complete();
  }

  public onChartInit(chart: ECharts): void {
    this._chart$.next(chart);
  }

  private checkIsMultiple(events: EE_IChartEventItem[]): boolean {
    if (!events?.length) {
      return false;
    }

    const type = events[0].type;
    return events.some((event) => event.type !== type);
  }

  private getChartZoom(): SliderDataZoomComponentOption {
    return {
      type: 'slider',
      labelFormatter: (v: number) => {
        if (!v) {
          return null;
        }

        return formatDate(new Date(v), 'MM.dd', this.locale);
      },
      textStyle: {
        color: CHART_OPTIONS.COLOR.TEXT,
        fontWeight: CHART_OPTIONS.FONT.WEIGHT,
        fontSize: CHART_OPTIONS.FONT.SIZE,
        lineHeight: CHART_OPTIONS.FONT.LINE_HEIGHT,
      },
      startValue: this.service.zoom[0],
      endValue: this.service.zoom[1],
      minValueSpan: CHART_OPTIONS.TIME_SPAN,
      left: 50,
      top: 332,
      right: 50,
      bottom: 0,
      brushSelect: false,
    };
  }

  private getChartTooltip(): TooltipComponentOption {
    return {
      show: true,
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        axis: 'x',
        lineStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(24, 144, 255, 1)' },
              { offset: 1, color: 'rgba(24, 144, 255, 0)' },
            ],
          },
          width: 1,
          type: 'solid',
        },
      },
      enterable: true,
      renderMode: 'html',
      className: 'chart-tooltip-container',
      position: (point, params, dom, rect, size) => [
        point[0] + size.contentSize[0] + 40 < size.viewSize[0] ? point[0] + 34 : point[0] - 34 - size.contentSize[0],
        8,
      ],
      formatter: (params) => {
        if (!(params instanceof Array)) {
          params = [params];
        }

        const [x, y] = params[0].value as [Date, number];
        const events = this.service.getEvents(+x);

        let template = `
          <section class="chart-tooltip-header">
            <h6>${formatDate(x, 'yyyy-MM-dd', this.locale)}</h6>
            <div class="mt8">
              <span class="chart-tooltip-icon mr8"></span>
              <span class="">能耗值：${this.pNumberSeparator.transform(y, 3) ?? '--'}</span>
            </div>
          </section>
        `;
        events.forEach((event) => {
          const option = this.typeOptions.filter((option) => option.value === event.type)[0];
          template += `
            <section class="chart-tooltip-event mt8">
              <div style="background-color: ${option.color.replace(/\d+(?=\))/, '0.15')}" class="event-type-container">
                ${option.label}
              </div>
              <h6 title="${event.title}">${event.title}</h6>
              <div class="mt8">
                <span style="background-color: ${option.color}" class="chart-tooltip-icon mr8"></span>
                <span>能耗变化量：${this.pNumberSeparator.transform(event.value, 3) ?? '--'}</span>
              </div>
              <p class="mt8">${event.description ?? ''}</p>
            </section>
          `;
        });

        return template;
      },
      padding: 12,
      textStyle: {
        color: CHART_OPTIONS.COLOR.TEXT,
        fontWeight: CHART_OPTIONS.FONT.WEIGHT,
        fontSize: CHART_OPTIONS.FONT.SIZE,
        lineHeight: CHART_OPTIONS.FONT.LINE_HEIGHT,
      },
      extraCssText: 'box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.15)',
    };
  }

  private getChartSeries(): LineSeriesOption {
    return {
      type: 'line',
      symbol: 'circle',
      symbolSize: 10,
      itemStyle: { color: 'rgba(24, 144, 255, 1)' },
      lineStyle: { color: 'rgba(24, 144, 255, 1)', width: 1 },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(24, 144, 255, 0.4)' },
            { offset: 1, color: 'rgba(24, 144, 255, 0)' },
          ],
        },
      },
      emphasis: { scale: true, lineStyle: null },
      data: this.service.series.map(([x, y]) => {
        const events = this.service.getEvents(+x);
        if (!events?.length) {
          return {
            value: [x, y],
            symbol: 'emptyCircle',
            symbolSize: 5,
          };
        }
        if (this.checkIsMultiple(events)) {
          return {
            value: [x, y],
            emphasis: { itemStyle: { color: 'white', borderColor: 'rgba(24, 144, 255, 1)', borderWidth: 2 } },
          };
        } else {
          const color = this.typeOptions.filter((option) => option.value === events[0].type)[0]?.color;
          return {
            value: [x, y],
            itemStyle: { color },
            emphasis: { itemStyle: { color: 'white', borderColor: color, borderWidth: 2 } },
          };
        }
      }),
    };
  }

  private initChart(): void {
    this.chartOptions = {
      grid: {
        left: 0,
        top: 42,
        right: 32,
        bottom: 40,
        containLabel: true,
      },
      xAxis: {
        type: 'time',
        boundaryGap: false,
        minInterval: CHART_OPTIONS.TIME_SPAN * 1.5,
        axisLine: {
          show: true,
        },
        axisTick: {
          show: true,
          alignWithLabel: true,
          length: 3,
        },
        axisLabel: {
          show: true,
          margin: 12,
          formatter: '{MM}.{dd}',
          color: CHART_OPTIONS.COLOR.TEXT,
          fontWeight: CHART_OPTIONS.FONT.WEIGHT,
          fontSize: CHART_OPTIONS.FONT.SIZE,
          lineHeight: CHART_OPTIONS.FONT.LINE_HEIGHT,
        },
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: true,
        },
        axisLabel: {
          show: true,
          margin: 4,
          color: CHART_OPTIONS.COLOR.TEXT,
          fontWeight: CHART_OPTIONS.FONT.WEIGHT,
          fontSize: CHART_OPTIONS.FONT.SIZE,
          lineHeight: CHART_OPTIONS.FONT.LINE_HEIGHT,
        },
        splitLine: {
          show: true,
          lineStyle: { color: CHART_OPTIONS.COLOR.LINE, type: 'dashed' },
        },
      },
      dataZoom: this.getChartZoom(),
      tooltip: this.getChartTooltip(),
      series: this.getChartSeries(),
    };
  }
}
