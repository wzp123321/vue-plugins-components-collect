/*
 * @Description: 地图可视化大屏服务（全国视角 + 省份下钻）
 * @Author: zpwan / 合并自 chart-map 与 chart-province
 * @Date: 2026-10-21
 *
 * 设计：单一 ECharts 实例，按 level 切换「全国 / 省份」两套 option。
 * - 全国视角：china-national 地图（geojson/china.json，含 35 个省级要素），
 *   按 seeded 发电量着色 + 省级散点，点击省份下钻。
 * - 省份视角：复用 chart-province 的懒加载 + 城市统计 + 项目散点 + TOP10 联动。
 */
import { ref } from 'vue'
import * as echarts from 'echarts/core'
import { EffectScatterChart, MapChart, ScatterChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, VisualMapComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { init } from '@/config/echarts/setup';
import type { EChartsType, EChartsOption } from '@/config/echarts/setup';
import {
  EffectScatterSeriesOption,
  MapSeriesOption,
  ScatterSeriesOption,
} from 'echarts/types/dist/shared'

import mapConfig from './map/map-config.json'
import texture from './images/ch-map-texture.png'
import chinaNational from '../../../assets/geojson/china.json'

echarts.use([
  CanvasRenderer,
  MapChart,
  ScatterChart,
  EffectScatterChart,
  GridComponent,
  TooltipComponent,
  VisualMapComponent,
])

echarts.registerMap('china-national', chinaNational as any)

/** 省份选项：本地 src/assets/geojson/province 已内置 33 个省级 GeoJSON */
const PROVINCE_OPTIONS = [
  { adcode: '110000', name: '北京市' },
  { adcode: '120000', name: '天津市' },
  { adcode: '130000', name: '河北省' },
  { adcode: '140000', name: '山西省' },
  { adcode: '150000', name: '内蒙古自治区' },
  { adcode: '210000', name: '辽宁省' },
  { adcode: '220000', name: '吉林省' },
  { adcode: '230000', name: '黑龙江省' },
  { adcode: '310000', name: '上海市' },
  { adcode: '320000', name: '江苏省' },
  { adcode: '330000', name: '浙江省' },
  { adcode: '340000', name: '安徽省' },
  { adcode: '350000', name: '福建省' },
  { adcode: '360000', name: '江西省' },
  { adcode: '370000', name: '山东省' },
  { adcode: '410000', name: '河南省' },
  { adcode: '420000', name: '湖北省' },
  { adcode: '430000', name: '湖南省' },
  { adcode: '440000', name: '广东省' },
  { adcode: '450000', name: '广西壮族自治区' },
  { adcode: '460000', name: '海南省' },
  { adcode: '500000', name: '重庆市' },
  { adcode: '510000', name: '四川省' },
  { adcode: '520000', name: '贵州省' },
  { adcode: '530000', name: '云南省' },
  { adcode: '540000', name: '西藏自治区' },
  { adcode: '610000', name: '陕西省' },
  { adcode: '620000', name: '甘肃省' },
  { adcode: '630000', name: '青海省' },
  { adcode: '640000', name: '宁夏回族自治区' },
  { adcode: '650000', name: '新疆维吾尔自治区' },
  { adcode: '810000', name: '中国香港' },
  { adcode: '820000', name: '中国澳门' },
]

// Vite 懒加载省级 GeoJSON：每个文件生成独立 chunk，切换省份时按需拉取
const provinceGeoLoaders = import.meta.glob('/src/assets/geojson/province/*.json')

enum CP_EProfitState {
  亏损 = 1,
  低盈利,
  中盈利,
  高盈利,
}

const PROFIT_LABELS: Record<number, string> = {
  [CP_EProfitState.亏损]: '亏损',
  [CP_EProfitState.低盈利]: '低盈利',
  [CP_EProfitState.中盈利]: '中盈利',
  [CP_EProfitState.高盈利]: '高盈利',
}

export interface CityStat {
  adcode: number
  name: string
  center: [number, number]
  /** 发电量 GWh */
  power: number
  projectCount: number
  alarmCount: number
  profitState: CP_EProfitState
}

export interface ProjectInfo {
  id: string
  name: string
  cityName: string
  coordinate: [number, number]
  alarm: boolean
  profitState: CP_EProfitState
}

export type DashboardLevel = 'national' | 'province'

/** 地图着色 / 排行可切换的指标维度 */
export type MetricKey = 'power' | 'projectCount' | 'alarmCount'

/** 时间筛选范围（影响发电量统计口径） */
export type TimeRangeKey = 'all' | 'year' | 'month' | 'week'

export const METRIC_OPTIONS: { value: MetricKey; label: string }[] = [
  { value: 'power', label: '发电量' },
  { value: 'projectCount', label: '项目数' },
  { value: 'alarmCount', label: '告警数' },
]

export const TIME_RANGE_OPTIONS: { value: TimeRangeKey; label: string }[] = [
  { value: 'all', label: '全部时间' },
  { value: 'year', label: '近一年' },
  { value: 'month', label: '近一月' },
  { value: 'week', label: '近一周' },
]

/** 时间范围对应的发电量折算系数（确定性 mock，无需随机） */
const TIME_SCALES: Record<TimeRangeKey, number> = {
  all: 1,
  year: 0.92,
  month: 0.16,
  week: 0.04,
}

/** 搜索结果：全国视角为省份，省份视角为城市 */
export interface SearchPlace {
  kind: 'province' | 'city'
  key: string
  label: string
  sub: string
  name: string
  adcode?: string
  city?: CityStat
}

/** 全国视角省级统计 */
export interface ProvinceStat {
  name: string
  adcode: number
  power: number
  projectCount: number
  alarmCount: number
  alarm: boolean
}

/**
 * 确定性伪随机：同一 adcode 每次刷新结果一致，演示页避免数据乱跳
 */
const seededValue = (adcode: number, salt: number): number => {
  const x = Math.sin(adcode * 127.1 + salt * 311.7) * 43758.5453
  return x - Math.floor(x)
}

/** 以下原为 ChartDashboardService 的私有方法——均为不依赖实例状态的纯函数，
 *  按 class-methods-use-this 规则外置为模块级箭头函数，行为不变 */
const loadProvinceGeo = async (adcode: string): Promise<any | null> => {
    const loader = provinceGeoLoaders[`/src/assets/geojson/province/${adcode}.json`]

    if (!loader) {
      return null
    }
    try {
      const module = (await loader()) as any
      return module.default || module
    } catch (error) {
      console.warn(`加载 ${adcode} 地图数据失败`, error)
      return null
    }
}

const buildCityStats = (features: any[], scale = 1): CityStat[] =>
    features
      .filter((feature) => feature?.properties?.center)
      .map((feature) => {
        const { adcode, name, center } = feature.properties
        const power = Math.round((20 + seededValue(adcode, 1) * 480) * scale)
        const projectCount = 2 + Math.floor(seededValue(adcode, 2) * 16)
        const alarmCount = Math.floor(seededValue(adcode, 3) * 5)
        const profitState = (1 + Math.floor(seededValue(adcode, 4) * 4)) as CP_EProfitState
        return { adcode, name, center, power, projectCount, alarmCount, profitState }
      })
      .sort((a, b) => b.power - a.power)

/** 全国视角：省级统计（power 随筛选时间折算，其余维度固定） */
const buildProvinceStats = (features: any[], scale = 1): ProvinceStat[] =>
    features
      .filter((f) => f?.properties?.adcode && (f.properties.centroid || f.properties.center))
      .map((f) => {
        const { adcode, name } = f.properties
        return {
          name,
          adcode,
          power: Math.round((120 + seededValue(adcode, 1) * 880) * scale),
          projectCount: 3 + Math.floor(seededValue(adcode, 2) * 20),
          alarmCount: Math.floor(seededValue(adcode, 3) * 9),
          alarm: seededValue(adcode, 9) > 0.82,
        }
      })

const buildProjects = (cities: CityStat[]): ProjectInfo[] => {
    const list: ProjectInfo[] = []

    cities.forEach((city) => {
      for (let i = 0; i < city.projectCount; i++) {
        list.push({
          id: `${city.adcode}-${i}`,
          name: `${city.name}${i + 1}号电站`,
          cityName: city.name,
          coordinate: [
            city.center[0] + (seededValue(city.adcode, 10 + i) - 0.5) * 0.5,
            city.center[1] + (seededValue(city.adcode, 20 + i) - 0.5) * 0.5,
          ],
          alarm: i < city.alarmCount,
          profitState: city.profitState,
        })
      }
    })
    return list
}

const mapGrid = (): EChartsOption['grid'] => ({ top: 0, right: 0, bottom: 0, left: 0 })

const nationalTooltip = (): EChartsOption['tooltip'] => ({
      trigger: 'item',
      enterable: true,
      renderMode: 'html',
      confine: true,
      className: 'ch-map-tooltip',
      position: 'right',
      padding: 0,
      backgroundColor: 'rgba(6, 39, 65, 0.95)',
      borderColor: 'rgba(54, 129, 255, 1)',
      borderWidth: 1,
      formatter: (params: any) => {
        if (params.seriesType !== 'map') return ''
        const data = params.data || {}
        const power = data.power ?? data.value ?? 0
        const projectCount = data.projectCount ?? '-'
        const alarmCount = data.alarmCount ?? '-'
        const drillable = PROVINCE_OPTIONS.some((o) => o.name === params.name)
        return `
          <div style="padding:10px 14px;color:#d6e8ff;font-size:12px;min-width:170px;line-height:1.8;">
            <div style="font-size:14px;font-weight:600;color:#ffffff;margin-bottom:6px;">${params.name}</div>
            <div style="display:flex;justify-content:space-between;"><span>发电量</span><span style="color:#7fe3f0;">${power} GWh</span></div>
            <div style="display:flex;justify-content:space-between;"><span>项目数</span><span style="color:#7fe3f0;">${projectCount}</span></div>
            <div style="display:flex;justify-content:space-between;"><span>告警数</span><span style="color:${Number(alarmCount) ? '#ff7a45' : '#7fe3f0'};">${alarmCount}</span></div>
          <div style="color:${drillable ? '#7fe3f0' : '#9ec9ff'};margin-top:4px;">${drillable ? '▸ 点击下钻到省份' : '暂未收录下级地图'}</div>
        </div>
      `
      },
    })

const mapTooltip = (): EChartsOption['tooltip'] => ({
      trigger: 'item',
      enterable: true,
      renderMode: 'html',
      confine: true,
      className: 'ch-map-tooltip',
      position: 'right',
      padding: 0,
      backgroundColor: 'rgba(6, 39, 65, 0.95)',
      borderColor: 'rgba(54, 129, 255, 1)',
      borderWidth: 1,
      formatter: (params: any) => {
        // 地图区域 → 城市指标
        if (params.seriesType === 'map') {
          const city = params.data?.city as CityStat | undefined
          if (!city) return ''
          return `
            <div style="padding:10px 14px;color:#d6e8ff;font-size:12px;min-width:190px;line-height:1.8;">
              <div style="font-size:14px;font-weight:600;color:#ffffff;margin-bottom:6px;">${city.name}</div>
              <div style="display:flex;justify-content:space-between;"><span>发电量</span><span style="color:#7fe3f0;">${city.power} GWh</span></div>
              <div style="display:flex;justify-content:space-between;"><span>项目数</span><span style="color:#7fe3f0;">${city.projectCount}</span></div>
              <div style="display:flex;justify-content:space-between;"><span>告警数</span><span style="color:${city.alarmCount ? '#ff7a45' : '#7fe3f0'};">${city.alarmCount}</span></div>
              <div style="display:flex;justify-content:space-between;"><span>盈利状态</span><span style="color:#7fe3f0;">${PROFIT_LABELS[city.profitState]}</span></div>
            </div>
          `
        }
        // 项目散点 → 项目信息
        const project = params.data?.project as ProjectInfo | undefined
        if (!project) return ''
        return `
          <div style="padding:10px 14px;color:#d6e8ff;font-size:12px;min-width:170px;line-height:1.8;">
            <div style="font-size:14px;font-weight:600;color:#ffffff;margin-bottom:6px;">${project.name}</div>
            <div style="display:flex;justify-content:space-between;"><span>所属城市</span><span style="color:#7fe3f0;">${project.cityName}</span></div>
            <div style="display:flex;justify-content:space-between;"><span>盈利状态</span><span style="color:#7fe3f0;">${PROFIT_LABELS[project.profitState]}</span></div>
            <div style="display:flex;justify-content:space-between;"><span>运行状态</span><span style="color:${project.alarm ? '#ff7a45' : '#7fe3f0'};">${project.alarm ? '告警' : '正常'}</span></div>
          </div>
        `
      },
  })


class ChartDashboardService {
  static readonly provinceOptions = PROVINCE_OPTIONS

  static readonly profitLabels = PROFIT_LABELS

  static readonly metricOptions = METRIC_OPTIONS

  static readonly timeRangeOptions = TIME_RANGE_OPTIONS

  private customId = ref<string>('')

  public myEchart?: EChartsType

  private option: EChartsOption = {}

  /** 当前视图层级 */
  public level = ref<DashboardLevel>('national')

  /** 当前省 adcode（省份视图） */
  public currentAdcode = ref('')

  /** 当前省名称（省份视图） */
  public currentProvinceName = ref('')

  /** 当前着色 / 排行指标 */
  public metric = ref<MetricKey>('power')

  /** 当前时间筛选 */
  public timeRange = ref<TimeRangeKey>('all')

  /** 数据版本号：视图切换、指标/时间变化、下钻时自增，供页面派生告警列表 */
  public version = ref(0)

  /** 全国视角：各省发电量（seeded），用于着色 */
  private provincePowers: ProvinceStat[] = []

  /** 省份视角下当前省的 GeoJSON features，切换时间口径时复用 */
  private currentProvinceFeatures: any[] = []

  /** 地图缩放与中心（工具条控制） */
  private geoZoom = 1

  private geoCenter?: [number, number]

  /** 当前省城市统计（按发电量降序），ref 化供外层 computed 追踪 */
  private cityStats = ref<CityStat[]>([])

  /** 全省项目点 */
  private projects = ref<ProjectInfo[]>([])

  /** 当前选中城市名，空串表示全省视图 */
  private selectedCityName = ref('')

  /** 当前注册的地图名（用 adcode） */
  private currentMapName = ''

  /** 城市数据就绪回调（侧栏排行渲染） */
  public onCitiesChange?: (cities: CityStat[]) => void

  /** 地图点击 / 侧栏选中城市回调 */
  public onCitySelect?: (city: CityStat | null) => void

  /** 视图层级变化回调（面包屑渲染） */
  public onLevelChange?: (level: DashboardLevel) => void

  public get customChartId(): string {
    return this.customId.value
  }

  constructor() {
    this.customId.value = `charts_${(Math.random() * 10000).toFixed(0)}`
  }

  // #region 初始化
  initCharts() {
    const ele = document.getElementById(this.customId.value)

    if (!ele) {
      console.warn('未加载容器')
      return
    }
    this.myEchart = init(ele)
    this.bindMapClick()
    this.renderNational()
  }
  // #endregion

  // #region 全国视角
  renderNational() {
    this.level.value = 'national'
    this.onLevelChange?.('national')

    const features: any[] = (chinaNational as any).features || []
    // 过滤掉无中心点的要素：china.json 含九段线（adcode 100000_JD、name 为空）这类
    // 仅用于描边的要素，缺少 center/centroid，进入 provincePowers 后会让散点/告警取坐标时崩溃
    this.provincePowers = buildProvinceStats(features, TIME_SCALES[this.timeRange.value])
    const maxPower = this.metricMaxOf(this.provincePowers)

    this.option = {}
    this.option.grid = mapGrid()
    this.option.tooltip = nationalTooltip()
    this.option.visualMap = {
      show: true,
      type: 'continuous',
      min: 0,
      max: maxPower,
      left: 24,
      bottom: 28,
      itemHeight: 110,
      text: ['高发电量', '低'],
      textStyle: { color: '#9ec9ff', fontSize: 12 },
      calculable: true,
      inRange: { color: ['#0b2f5e', '#12507e', '#1b7fb8', '#35b8e8', '#7fe3f0'] },
    } as any
    this.option.geo = {
      map: 'china-national',
      roam: true,
      aspectScale: 1.0,
      silent: true,
      itemStyle: {
        areaColor: { image: texture, repeat: 'no-repeat' },
        borderColor: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: '#264571' },
            { offset: 1, color: '#009EFF' },
          ],
        },
        borderWidth: 2,
        shadowBlur: 15,
        shadowColor: 'rgba(51, 149, 216, 1)',
        shadowOffsetY: 10,
      },
    }
    const mapSeries: MapSeriesOption = {
      type: 'map',
      map: 'china-national',
      geoIndex: 0,
      roam: true,
      selectedMode: false,
      label: { show: false },
      itemStyle: {
        borderColor: '#009EFF',
        borderWidth: 1,
        shadowBlur: 20,
        shadowColor: 'rgba(109, 178, 236, 0.5)',
      },
      emphasis: {
        label: { show: true, color: '#ffffff', fontSize: 12 },
        itemStyle: { areaColor: '#ffd666', borderColor: '#ffffff', borderWidth: 2 },
      },
      select: { disabled: true },
      data: this.provincePowers.map((p) => ({
        name: p.name,
        value: this.getMetricValue(p),
        power: p.power,
        projectCount: p.projectCount,
        alarmCount: p.alarmCount,
      })),
    }

    // 省级项目散点（取各省 centroid 附近的 seeded 点）
    const projectSeries: ScatterSeriesOption = {
      type: 'scatter',
      id: 'national-projects',
      coordinateSystem: 'geo',
      geoIndex: 0,
      symbol: 'none',
      zlevel: 100,
      data: this.provincePowers.map((p) => {
        const feat = features.find((f) => f.properties.adcode === p.adcode)
        const c = (feat?.properties?.centroid || feat?.properties?.center) as [number, number]
        const jitter = (k: number) => (seededValue(p.adcode, k) - 0.5) * 4
        return {
          name: p.name,
          value: [c[0] + jitter(5), c[1] + jitter(6), p.power],
        }
      }),
    }

    // 告警波纹（少量省份高亮）
    const alarmSeries: EffectScatterSeriesOption = {
      type: 'effectScatter',
      id: 'national-alarms',
      coordinateSystem: 'geo',
      geoIndex: 0,
      zlevel: 100,
      rippleEffect: { color: '#FF3F00', number: 3, scale: 2.5, brushType: 'stroke' },
      symbol: `image://${mapConfig.mark.alarm}`,
      symbolSize: [22, 20],
      data: this.provincePowers
        .filter((p) => p.alarm)
        .map((p) => {
          const feat = features.find((f) => f.properties.adcode === p.adcode)
          const c = (feat?.properties?.centroid || feat?.properties?.center) as [number, number]
          return { name: p.name, value: [c[0], c[1]] }
        }),
    }

    this.option.series = [mapSeries, projectSeries, alarmSeries] as any
    this.geoZoom = 1
    this.geoCenter = undefined
    this.myEchart?.setOption(this.option, true)
    this.version.value++
  }
  // #endregion

  // #region 省份下钻
  async drillToProvince(adcode: string, name: string) {
    const geo = await loadProvinceGeo(adcode)

    if (!geo?.features?.length) {
      console.warn(`未找到 ${name} 的地图数据`)
      return
    }
    this.currentMapName = adcode
    this.currentAdcode.value = adcode
    this.currentProvinceName.value = name
    this.selectedCityName.value = ''
    this.level.value = 'province'
    this.onLevelChange?.('province')
    echarts.registerMap(adcode, geo as any)
    this.currentProvinceFeatures = geo.features
    this.geoZoom = 1
    this.geoCenter = undefined

    this.cityStats.value = buildCityStats(geo.features, TIME_SCALES[this.timeRange.value])
    this.projects.value = buildProjects(this.cityStats.value)
    this.applyOption()
    this.onCitiesChange?.(this.cityStats.value)
    this.onCitySelect?.(null)
    this.version.value++
  }

  backToNational() {
    this.renderNational()
  }
  // #endregion

  // #region 懒加载省级 GeoJSON

  // #endregion

  // #region 构造城市统计（确定性 mock）

  // #endregion

  // #region 构造项目散点

  // #endregion

  // #region 应用配置（省份视角）
  private applyOption() {
    this.option = {}
    this.option.grid = mapGrid()
    this.option.tooltip = mapTooltip()
    this.option.visualMap = this.mapVisualMap()
    this.option.geo = this.mapGeo()
    this.option.series = this.mapSeries()
    this.myEchart?.setOption(this.option, true)
    this.version.value++
  }
  // #endregion

  // #region 全国 tooltip

  // #endregion

  // #region 省份 tooltip

  // #endregion

  private mapVisualMap(): EChartsOption['visualMap'] {
    const maxPower = this.metricMaxOf(this.cityStats.value)
    return {
      show: true,
      type: 'continuous',
      min: 0,
      max: maxPower,
      seriesIndex: [0],
      left: 24,
      bottom: 28,
      itemHeight: 90,
      text: ['高', '低'],
      textStyle: { color: '#9ec9ff', fontSize: 12 },
      calculable: true,
      inRange: { color: ['#0b2f5e', '#12507e', '#1b7fb8', '#35b8e8', '#7fe3f0'] },
    } as any
  }

  private mapGeo(): EChartsOption['geo'] {
    return {
      map: this.currentMapName,
      roam: true,
      aspectScale: 1.1,
      silent: true,
      itemStyle: {
        areaColor: { image: texture, repeat: 'no-repeat' },
        borderColor: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
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
    }
  }

  private mapSeries(): EChartsOption['series'] {
    // 城市数据层：visualMap 着色
    const mapSeries: MapSeriesOption = {
      type: 'map',
      map: this.currentMapName,
      geoIndex: 0,
      roam: true,
      selectedMode: 'single',
      label: { show: false },
      itemStyle: {
        borderColor: '#009EFF',
        borderWidth: 1,
        shadowBlur: 20,
        shadowColor: 'rgba(109, 178, 236, 0.5)',
      },
      emphasis: {
        label: { show: true, color: '#ffffff', fontSize: 12 },
        itemStyle: { areaColor: '#ffd666', borderColor: '#ffffff', borderWidth: 2 },
      },
      select: {
        label: { show: true, color: '#ffffff', fontSize: 12 },
        itemStyle: { areaColor: '#ffd666', borderColor: '#ffffff', borderWidth: 2 },
      },
      data: this.cityStats.value.map((city) => ({
        name: city.name,
        value: this.getMetricValue(city),
        city,
      })),
    }

    // 项目散点：按盈利状态使用不同图标
    const projectSeries: ScatterSeriesOption = {
      type: 'scatter',
      id: 'projects',
      coordinateSystem: 'geo',
      geoIndex: 0,
      symbol: 'none',
      zlevel: 100,
      emphasis: undefined,
      data: this.projects.value
        .filter((project) => !project.alarm)
        .map((project) => {
          const item: { [key: string]: any } = {
            name: project.name,
            value: [...project.coordinate, project.profitState],
            project,
          }
          switch (project.profitState) {
            case CP_EProfitState.亏损:
              item.symbol = `image://${mapConfig.mark.deficit}`
              break
            case CP_EProfitState.低盈利:
              item.symbol = `image://${mapConfig.mark.low}`
              break
            case CP_EProfitState.中盈利:
              item.symbol = `image://${mapConfig.mark.middle}`
              break
            case CP_EProfitState.高盈利:
              item.symbol = `image://${mapConfig.mark.high}`
              break
            default:
              break
          }
          item.symbolSize = [24, 33]
          return item
        }),
    }

    // 告警波纹点
    const alarmSeries: EffectScatterSeriesOption = {
      type: 'effectScatter',
      id: 'events',
      coordinateSystem: 'geo',
      geoIndex: 0,
      zlevel: 100,
      rippleEffect: { color: '#FF3F00', number: 3, scale: 2.5, brushType: 'stroke' },
      symbol: `image://${mapConfig.mark.alarm}`,
      symbolSize: [26, 23],
      label: {
        show: true,
        position: 'top',
        distance: 5,
        formatter: '能源事件',
        color: '#FF3B00',
        fontSize: 10,
      },
      data: this.projects.value
        .filter((project) => project.alarm)
        .map((project) => ({
          name: project.name,
          value: [...project.coordinate, project.profitState],
          project,
        })) as any,
    }

    return [mapSeries, projectSeries, alarmSeries] as any
  }

  // #region 地图点击：全国下钻 / 省份选中城市
  private bindMapClick() {
    this.myEchart?.on('click', (params: any) => {
      if (this.level.value === 'national') {
        if (params.seriesType !== 'map') return
        const opt = PROVINCE_OPTIONS.find((o) => o.name === params.name)
        if (!opt) return
        this.drillToProvince(opt.adcode, opt.name)
        return
      }
      // 省份视角：点击城市区域选中 / 取消
      if (params.seriesType !== 'map') return
      const city = params.data?.city as CityStat | undefined
      if (!city) return
      this.selectCity(city.name === this.selectedCityName.value ? '' : city.name)
    })
  }
  // #endregion

  // #region 选中城市（地图 + 侧栏联动）
  selectCity(cityName: string) {
    this.selectedCityName.value = cityName
    const city = this.cityStats.value.find((item) => item.name === cityName) || null
    if (city) {
      this.myEchart?.dispatchAction({ type: 'select', seriesIndex: 0, name: city.name })
    } else {
      this.myEchart?.dispatchAction({ type: 'unselect', seriesIndex: 0 })
    }
    this.onCitySelect?.(city)
  }
  // #endregion

  // #region 侧栏 hover 与地图联动
  highlightCity(cityName: string) {
    this.myEchart?.dispatchAction({ type: 'highlight', seriesIndex: 0, name: cityName })
  }

  downplayCity(cityName: string) {
    this.myEchart?.dispatchAction({ type: 'downplay', seriesIndex: 0, name: cityName })
  }
  // #endregion

  // #region 数据查询
  getProjects(): ProjectInfo[] {
    return this.projects.value
  }

  getProjectsByCity(cityName: string): ProjectInfo[] {
    return this.projects.value.filter((project) => project.cityName === cityName)
  }

  getAlarmProjects(): ProjectInfo[] {
    return this.projects.value.filter((project) => project.alarm)
  }

  getProvinceSummary() {
    return {
      cityCount: this.cityStats.value.length,
      totalPower: this.cityStats.value.reduce((sum, city) => sum + city.power, 0),
      projectCount: this.projects.value.length,
      alarmCount: this.projects.value.filter((project) => project.alarm).length,
    }
  }
  // #endregion

  // #region 指标 / 时间 / 搜索 / 地图工具
  getMetricValue(item: Pick<CityStat, 'power' | 'projectCount' | 'alarmCount'>): number {
    switch (this.metric.value) {
      case 'projectCount':
        return item.projectCount
      case 'alarmCount':
        return item.alarmCount
      default:
        return item.power
    }
  }

  private metricMaxOf(list: Pick<CityStat, 'power' | 'projectCount' | 'alarmCount'>[]): number {
    return list.reduce((max, item) => Math.max(max, this.getMetricValue(item)), 1)
  }

  /** 切换着色 / 排行指标 */
  setMetric(key: MetricKey) {
    if (this.metric.value === key) return
    this.metric.value = key
    this.refreshView()
  }

  /** 切换时间口径，按范围重新折算发电量并刷新视图 */
  setTimeRange(key: TimeRangeKey) {
    if (this.timeRange.value === key) return
    this.timeRange.value = key
    if (this.level.value === 'national') {
      this.renderNational()
      return
    }
    this.rebuildProvinceData()
  }

  private rebuildProvinceData() {
    if (!this.currentProvinceFeatures.length) return
    this.cityStats.value = buildCityStats(this.currentProvinceFeatures, TIME_SCALES[this.timeRange.value])
    this.projects.value = buildProjects(this.cityStats.value)
    this.selectedCityName.value = ''
    this.applyOption()
    this.onCitiesChange?.(this.cityStats.value)
    this.onCitySelect?.(null)
  }

  private refreshView() {
    if (this.level.value === 'national') {
      this.renderNational()
      return
    }
    this.applyOption()
    if (this.selectedCityName.value) this.selectCity(this.selectedCityName.value)
  }

  /** 搜索省份 / 城市，返回候选项 */
  searchPlaces(keyword: string): SearchPlace[] {
    const kw = keyword.trim().toLowerCase()
    if (!kw) return []
    if (this.level.value === 'national') {
      return PROVINCE_OPTIONS.filter((option) => option.name.toLowerCase().includes(kw))
        .slice(0, 20)
        .map((option) => ({
          kind: 'province' as const,
          key: option.adcode,
          label: option.name,
          sub: '省级行政区',
          name: option.name,
          adcode: option.adcode,
        }))
    }
    return this.cityStats.value
      .filter((city) => city.name.toLowerCase().includes(kw))
      .slice(0, 20)
      .map((city) => ({
        kind: 'city' as const,
        key: String(city.adcode),
        label: city.name,
        sub: `${city.power} GWh · 项目 ${city.projectCount}`,
        name: city.name,
        city,
      }))
  }

  /** 搜索选中：全国下钻省份，省份视角定位城市 */
  focusPlace(place: SearchPlace) {
    if (place.kind === 'province') {
      this.drillToProvince(place.key, place.name)
      return
    }
    if (place.city) {
      this.selectCity(place.city.name)
      this.focusCoordinate(place.city.center, 2)
    }
  }

  /** 告警定位：选中城市并把地图移到项目坐标 */
  focusProject(project: ProjectInfo) {
    const city = this.cityStats.value.find((item) => item.name === project.cityName) || null
    if (city) this.selectCity(city.name)
    this.focusCoordinate(project.coordinate, 2.6)
    this.myEchart?.dispatchAction({ type: 'highlight', seriesIndex: 2, name: project.name })
  }

  /** 全国视角告警省份列表 */
  getNationalAlarms(): ProvinceStat[] {
    return this.provincePowers.filter((item) => item.alarm).sort((a, b) => b.power - a.power)
  }

  zoomIn() {
    this.setZoom(this.geoZoom + 0.3)
  }

  zoomOut() {
    this.setZoom(this.geoZoom - 0.3)
  }

  resetView() {
    this.geoZoom = 1
    this.geoCenter = undefined
    this.refreshView()
  }

  private setZoom(value: number) {
    this.geoZoom = Math.min(4, Math.max(0.6, Number(value.toFixed(2))))
    this.applyGeoView()
  }

  private focusCoordinate(center: [number, number], zoom: number) {
    this.geoCenter = center
    this.geoZoom = zoom
    this.applyGeoView()
  }

  private applyGeoView() {
    this.myEchart?.setOption({ geo: { zoom: this.geoZoom, center: this.geoCenter } } as any)
  }
  // #endregion

  resize() {
    this.myEchart?.resize()
  }

  dispose() {
    this.myEchart?.dispose()
    this.myEchart = undefined
  }
}

export default ChartDashboardService
