import { formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnDestroy, OnInit, Self } from '@angular/core';
import {
  ECharts,
  EChartsOption,
  LegendComponentOption,
  GridComponentOption,
  XAXisComponentOption,
  YAXisComponentOption,
  TooltipComponentOption,
  LineSeriesOption,
} from 'echarts';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';
import { PaginationService } from 'src/app/common/components/pagination/pagination.service';
import { NumberSeparatorPipe } from 'src/app/common/pipes/number-separator/number-separator.pipe';
import { LINE_CHART_COLOR_LIST, CHART_COLOR_OPTIONS, FMixinAlpha } from 'src/app/core/color/color.api';
import { B_IAnalysisSeriesItem } from '../../boiler.api';
import { BoilerSingleAnalysisService } from './boiler-single-analysis.service';

const INTERVAL = 3600_000;
const GAP = 75;

@Component({
  selector: 'ems-boiler-single-analysis',
  templateUrl: './boiler-single-analysis.component.html',
  styleUrls: ['./boiler-single-analysis.component.less'],
  providers: [BoilerSingleAnalysisService, NumberSeparatorPipe],
  viewProviders: [{ provide: PaginationService, useExisting: BoilerSingleAnalysisService }],
})
export class BoilerSingleAnalysisComponent implements OnInit, OnDestroy {
  public get isLoading(): boolean {
    return this.service.isLoading;
  }

  public get isEmpty(): boolean {
    return this.service.isEmpty;
  }

  public get dates(): Date[] {
    return this.service.dates;
  }

  public get series(): B_IAnalysisSeriesItem[] {
    return this.service.series;
  }

  public get index(): number {
    return this.service.index;
  }
  public get size(): number {
    return this.service.size;
  }

  private _subscriptions: Subscription[] = [];

  public type: 'chart' | 'table' = 'chart';

  public chart: ECharts;
  public chartLines: { [key: string]: boolean } = {};
  public chartOptions: EChartsOption = {};

  constructor(
    @Inject(LOCALE_ID) private locale: string,
    private nzMessage: NzMessageService,
    @Self() private service: BoilerSingleAnalysisService,
    @Self() private pNumberSeparator: NumberSeparatorPipe
  ) {}

  ngOnInit(): void {
    this._subscriptions.push(
      this.service.onSearch.subscribe(() => this.showChart()),
      this.service.onData.subscribe((success) => success && this.initChartOptions())
    );
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  public showChart(): void {
    this.type = 'chart';
  }

  public showTable(): void {
    this.type = 'table';
  }

  public toExport(): void {
    if (this.service.isLoading || this.service.isExporting) {
      return;
    }

    this.service.doExport();
  }

  public onChartInit(chart: ECharts): void {
    this.chart = chart;
  }

  public onSelectLegend(event: any): void {
    if (Object.values(event.selected).filter((selected) => selected).length > 10) {
      this.chartOptions.legend = this.mapChartLegend();
      this.chart?.setOption(this.chartOptions);
      this.nzMessage.error('最大支持展示10个参数');
    } else {
      this.chartLines = event.selected;
      this.chartOptions.legend = this.mapChartLegend();
      this.chartOptions.grid = this.mapChartGrid();
      this.chartOptions.yAxis = this.mapChartYAxis();
      this.chart?.setOption(this.chartOptions);
    }
  }

  public mapTableTitle(item: B_IAnalysisSeriesItem): string {
    return item.unit ? `${item.name}(${item.unit})` : item.name;
  }

  public mapTableIndex(index: number): number {
    return (this.service.index - 1) * this.service.size + index + 1;
  }

  public mapDateRange(date: Date): string {
    if (!date) {
      return null;
    }

    const start = formatDate(date, 'yyyy-MM-dd HH:mm', this.locale);
    const end = formatDate(new Date(+date + INTERVAL), 'HH:mm', this.locale);
    return `${start}~${end}`;
  }

  private initChartOptions(): void {
    if (!this.series.length) {
      return;
    }

    this.chartLines = Object.fromEntries(this.series.map((item, index) => [item.name, index ? false : true]));
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
      type: 'scroll',
      itemGap: 24,
      itemWidth: 20,
      itemHeight: 2,
      itemStyle: { opacity: 0 },
      inactiveColor: CHART_COLOR_OPTIONS.DISABLE,
      selected: this.chartLines,
      textStyle: { fontSize: 14, lineHeight: 20 },
      data: this.series.map((item, index) => ({
        name: item.name,
        textStyle: { color: LINE_CHART_COLOR_LIST[index % LINE_CHART_COLOR_LIST.length] },
      })),
      pageIconColor: CHART_COLOR_OPTIONS.PRIMARY,
      pageIconInactiveColor: CHART_COLOR_OPTIONS.DISABLE,
      pageTextStyle: { color: CHART_COLOR_OPTIONS.TEXT },
    };
  }

  private mapChartGrid(): GridComponentOption {
    const selected = this.series
      .slice(1)
      .filter((item) => this.chartLines[item.name])
      .map((item) => item.name);

    return {
      top: 36,
      right: selected.length ? GAP * (selected.length - 1) + 36 : 36,
      bottom: 36,
      left: 36,
      containLabel: false,
    };
  }

  private mapChartXAxis(): XAXisComponentOption {
    const split = 86400_000 * 1.5;
    return {
      type: 'time',
      min: ({ min, max }) => min - ((max - min) / split) * INTERVAL,
      max: ({ min, max }) => max + ((max - min) / split) * INTERVAL,
      minInterval: INTERVAL,
      axisLine: { lineStyle: { color: CHART_COLOR_OPTIONS.LINE } },
      axisTick: { show: false },
      axisLabel: {
        margin: 14,
        formatter: { year: '{M}.{d}', month: '{M}.{d}', day: '{M}.{d}', hour: '{HH}:{mm}' },
        color: CHART_COLOR_OPTIONS.TEXT,
        fontSize: 14,
        lineHeight: 22,
      },
    };
  }

  private mapChartYAxis(): YAXisComponentOption[] {
    const selected = this.series
      .slice(1)
      .filter((item) => this.chartLines[item.name])
      .map((item) => item.name);

    return this.series.map((item, index) => {
      const color = LINE_CHART_COLOR_LIST[index % LINE_CHART_COLOR_LIST.length];
      const sort = selected.indexOf(item.name);
      return {
        show: index ? this.chartLines[item.name] : true,
        offset: sort > 0 ? GAP * sort : 0,
        type: 'value',
        name: item.unit,
        nameLocation: 'start',
        nameTextStyle: { color, fontSize: 14, align: index ? 'left' : 'right', lineHeight: 22, padding: [0, 10] },
        nameGap: 14,
        axisLine: { show: true, lineStyle: { color } },
        axisTick: { show: true },
        axisLabel: {
          formatter: (value: number) => (value < 1000 ? value : `${value / 1000}k`),
          fontSize: 14,
          lineHeight: 22,
        },
        splitLine: {
          show: index ? !this.chartLines[this.series[0]?.name] && sort === 0 : this.chartLines[this.series[0]?.name],
          lineStyle: { color: CHART_COLOR_OPTIONS.LINE },
        },
      };
    });
  }

  private mapChartTooltip(): TooltipComponentOption {
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
              { offset: 0, color: CHART_COLOR_OPTIONS.PRIMARY },
              { offset: 1, color: FMixinAlpha(CHART_COLOR_OPTIONS.PRIMARY) },
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
        point[0] + size.contentSize[0] + 36 < size.viewSize[0] ? point[0] + 36 : point[0] - 36 - size.contentSize[0],
        28,
      ],
      formatter: (params) => {
        if (!(params instanceof Array)) {
          params = [params];
        }

        if (!params.length) {
          return null;
        }

        const date = (params[0].value as [Date, number])[0];
        let template = `
          <h6>${this.mapDateRange(date)}</h6>
        `;
        params.forEach((param) => {
          const [date, value, unit, color] = param.value as [Date, number, string, string];
          template += `
            <div class="chart-tooltip-item-container mt8">
              <span style="background-color: ${color}" class="chart-tooltip-item-icon"></span>
              <span class="chart-tooltip-item-text">
              ${param.seriesName}：${this.pNumberSeparator.transform(value, 3) ?? '--'}
              ${value == null ? '' : unit ?? ''}
              </span>
            </div>
          `;
        });

        return template;
      },
      backgroundColor: FMixinAlpha(CHART_COLOR_OPTIONS.PRIMARY, 0.8),
      borderColor: 'transparent',
      padding: [8, 12],
      extraCssText: 'box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.15)',
    };
  }

  private mapChartSeries(): LineSeriesOption[] {
    return this.series.map((item, index) => {
      const color = LINE_CHART_COLOR_LIST[index % LINE_CHART_COLOR_LIST.length];
      return {
        type: 'line',
        yAxisIndex: index,
        name: item.name,
        symbol: 'circle',
        symbolSize: 24,
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
                { offset: 7 / 24, color: 'transparent' },
                { offset: 9 / 24, color },
                { offset: 11 / 24, color: 'transparent' },
                { offset: 21 / 24, color: 'transparent' },
                { offset: 23 / 24, color },
              ],
            },
          },
        },
        smooth: true,
        data: item.data?.map((v, i, origin) => {
          if (origin[i - 1] != null || origin[i + 1] != null) {
            return { value: [this.dates[i], v, item.unit, color], itemStyle: { color: 'transparent' } };
          } else {
            return { value: [this.dates[i], v, item.unit, color] };
          }
        }),
      };
    });
  }
}
