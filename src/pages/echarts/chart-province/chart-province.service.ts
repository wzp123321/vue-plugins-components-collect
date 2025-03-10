/*
 * @Description: 服务
 * @Author: zpwan
 * @Date: 2022-06-06 16:28:15
 * @Last Modified by: zpwan
 * @Last Modified time: 2022-11-09 11:04:59
 */
import { ref } from 'vue'
import * as echarts from 'echarts/core'
import { EffectScatterChart, MapChart, ScatterChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { EChartsType, init, EChartsOption } from 'echarts'
import {
  EffectScatterSeriesOption,
  ScatterSeriesOption,
} from 'echarts/types/dist/shared'

// http://datav.aliyun.com/portal/school/atlas/area_selector下载省份json
// 中国
// import mapChina from './map/map-china.json'
// import mapChinaMerge from './map/map-china-merge.json'
// 四川
import mapSichuan from './map/map-sichuan.json'

import mapConfig from './map/map-config.json'
import texture from './images/ch-map-texture.png'

echarts.use([
  CanvasRenderer,
  MapChart,
  ScatterChart,
  EffectScatterChart,
  GridComponent,
  TooltipComponent,
])

// 注册中国地图
// echarts.registerMap('china', mapChina as any)
// echarts.registerMap('china-merge', mapChinaMerge as any)

// 注册四川地图
echarts.registerMap('四川', mapSichuan as any)

enum CH_EProfitState {
  亏损 = 1,
  低盈利,
  中盈利,
  高盈利,
}

interface CH_IProjectInfo {
  readonly id: string
  readonly code: string
  readonly tag?: string
  readonly name: string
  readonly coordinate: [number | undefined, number | undefined]
  readonly alarm: Boolean
  readonly state: number
  readonly profitState: CH_EProfitState
  readonly start: string
  readonly end: string
  readonly manager: string
  readonly surplus: { value: number; unit: string }
}

class ChartMapService {
  //#region
  private _customId = ref<string>('')
  public myEhart?: EChartsType
  private readonly _option: echarts.EChartsCoreOption = {}
  private projects: CH_IProjectInfo[] = [
    {
      id: '312312',
      code: '312312',
      tag: '312312',
      name: '312312',
      coordinate: [104.653133, 30.240185],
      alarm: false,
      state: 1,
      profitState: 1,
      start: '312312',
      end: '312312',
      manager: '12321312',
      surplus: { value: 123131, unit: 'string' },
    },
    {
      id: '312312',
      code: '312312',
      tag: '312312',
      name: '312312',
      coordinate: [103.787246, 31.434439],
      alarm: false,
      state: 1,
      profitState: 1,
      start: '312312',
      end: '312312',
      manager: '12321312',
      surplus: { value: 123131, unit: 'string' },
    },
  ]
  //#endregion

  //#region
  public get customChartId(): string {
    return this._customId.value
  }
  //#endregion
  constructor() {
    this._customId.value = `charts_${(Math.random() * 10000).toFixed(0)}`
  }
  //#region 初始化charts
  initCharts() {
    const ele = document.getElementById(this._customId.value)

    if (!ele) {
      console.warn('未加载容器')
      return
    }
    this.myEhart = init(ele)
    this._option.grid = this.mapGrid()
    this._option.tooltip = this.mapTooltip()
    this._option.geo = this.mapGeo()
    this._option.series = this.mapSeries()

    this.myEhart.setOption(this._option)

    this.initPoints(this.projects)
  }
  //#endregion
  //#region mapGrid
  mapGrid(): EChartsOption['grid'] {
    return { top: 0, right: 0, bottom: 0, left: 0 }
  }
  //#endregion
  //#region mapTooltip
  mapTooltip(): EChartsOption['tooltip'] {
    return {
      trigger: 'item',
      enterable: true,
      renderMode: 'html',
      confine: false,
      className: 'ch-map-tooltip',
      position: 'right',
      formatter: (_params) => {
        const template = `
          <div class="ch-map-tooltip-header">
            <span class="ch-map-tooltip-icon" rank="1231"></span>
            <h6 class="ch-map-tooltip-title">测试</h6>
            <span class="ch-map-tooltip-state">321312</span>
          </div>
          <div class="ch-map-tooltip-body">
            <div>
              <span class="ch-map-tooltip-label">测试</span>
              <span class="ch-map-tooltip-value">321312</span>
            </div>
            <div>
              <span class="ch-map-tooltip-label">测试</span>
              <span class="ch-map-tooltip-value">31231231</span>
            </div>
            <div>
              <span class="ch-map-tooltip-label">测试</span>
              <span class="ch-map-tooltip-value">32131231/span>
            </div>
          </div>
        `

        return template
      },
      backgroundColor: 'rgba(6, 39, 65, 1)',
      borderColor: 'rgba(54, 129, 255, 1)',
      borderWidth: 1,
    }
  }
  //#endregion
  //#region mapGeo
  mapGeo(): EChartsOption['geo'] {
    return {
      map: '四川',
      roam: false,
      itemStyle: {
        areaColor: { image: texture, repeat: 'no-repeat' },
        borderColor: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: '#264571' },
            { offset: 1, color: '#009EFF' },
          ],
        },
        borderWidth: 3,
        shadowBlur: 15,
        shadowColor: 'rgba(51, 149, 216, 1)',
        shadowOffsetY: 10,
      },
      emphasis: undefined,
      select: undefined,
      silent: true,
    }
  }
  //#endregion
  //#region mapSeries
  mapSeries(): EChartsOption['series'] {
    return {
      type: 'map',
      map: '四川',
      geoIndex: 1,
      roam: false,
      selectedMode: false,
      itemStyle: {
        areaColor: 'transparent',
        borderColor: '#009EFF',
        borderWidth: 1,
        shadowBlur: 20,
        shadowColor: 'rgba(109, 178, 236, 0.5)',
      },
      emphasis: undefined,
      select: undefined,
      silent: true,
    }
  }
  //#endregion
  //#region initPoints
  private initPoints(projects: any): void {
    const series: [ScatterSeriesOption, EffectScatterSeriesOption] = [
      {
        type: 'scatter',
        id: 'projects',
        coordinateSystem: 'geo',
        symbol: 'none',
        emphasis: undefined,
        data: [],
        zlevel: 100,
      },
      {
        type: 'effectScatter',
        id: 'events',
        rippleEffect: {
          color: '#FF3F00',
          number: 3,
          scale: 2.5,
          brushType: 'stroke',
        },
        coordinateSystem: 'geo',
        symbol: `image://${mapConfig.mark.alarm}`,
        symbolSize: [26, 23],
        label: {
          show: true,
          position: 'top',
          distance: 5,
          formatter: '能源事件',
          color: '#FF3B00',
        },
        emphasis: undefined,
        data: [],
        zlevel: 100,
      },
    ]

    projects.forEach((project: any) => {
      const item: { [key: string]: any } = {
        name: project.name,
        value: [...project.coordinate, project],
      }

      if (project.alarm) {
        ;(series[1].data as any[]).push(item)
      } else {
        item.symbolSize = [24, 33] || [16, 22]
        item.groupId = project.state
        switch (project.profitState) {
          case CH_EProfitState.亏损:
            item.symbol = `image://${mapConfig.mark.deficit}`
            break
          case CH_EProfitState.低盈利:
            item.symbol = `image://${mapConfig.mark.low}`
            break
          case CH_EProfitState.中盈利:
            item.symbol = `image://${mapConfig.mark.middle}`
            break
          case CH_EProfitState.高盈利:
            item.symbol = `image://${mapConfig.mark.high}`
            break
          default:
            break
        }
        ;(series[0].data as any[]).push(item)
      }
    })

    this._option.series = series
    this.myEhart?.setOption(this._option)
  }
  //#endregion
}

export default ChartMapService
