<template>
  <div class="chart-dashboard">
    <div class="cd-header">
      <div class="cd-header-title">
        <span class="cd-header-title-text">地图可视化大屏</span>
      </div>
      <div class="cd-header-light"></div>
      <div class="cd-header-toolbar">
        <template v-if="level === 'province'">
          <span class="cd-breadcrumb">
            <span class="cd-breadcrumb-item" @click="handleBackToNational">全国</span>
            <span class="cd-breadcrumb-sep">/</span>
            <span class="cd-breadcrumb-current">{{ currentProvinceName }}</span>
          </span>
        </template>
        <span v-else class="cd-header-hint">点击省份下钻</span>
        <el-select
          v-model="currentAdcode"
          class="cd-header-select"
          size="small"
          placeholder="切换省份"
          popper-class="cd-province-select-popper"
          @change="handleProvinceChange"
        >
          <el-option
            v-for="item in provinceOptions"
            :key="item.adcode"
            :label="item.name"
            :value="item.adcode"
          />
        </el-select>
      </div>
    </div>

    <div class="cd-body">
      <div class="cd-map-wrap" ref="mapWrapRef">
        <div class="cd-map-container" :id="dashboardService.customChartId"></div>
        <div v-if="level === 'province'" class="cd-map-legend">
          <span class="cd-map-legend-title">盈利状态</span>
          <span v-for="item in profitLegend" :key="item.state" class="cd-map-legend-item">
            <i class="cd-map-legend-icon" :style="{ backgroundImage: `url(${item.icon})` }"></i>
            {{ item.label }}
          </span>
          <span class="cd-map-legend-item">
            <i class="cd-map-legend-icon cd-map-legend-icon--alarm"></i>告警
          </span>
        </div>

        <cm-controls
          :metric="metric"
          :metric-options="metricOptions"
          :time-range="timeRange"
          :time-options="timeRangeOptions"
          :level="level"
          :alarm-count="alarmItems.length"
          :alarm-open="alarmVisible"
          :is-fullscreen="isFullscreen"
          :search="dashboardService.searchPlaces.bind(dashboardService)"
          @metric-change="handleMetricChange"
          @time-change="handleTimeRangeChange"
          @search-select="handleSearchSelect"
          @toggle-alarm="handleToggleAlarm"
          @zoom-in="dashboardService.zoomIn"
          @zoom-out="dashboardService.zoomOut"
          @reset-view="dashboardService.resetView"
          @toggle-fullscreen="handleToggleFullscreen"
        />

        <cm-alarm-center
          :visible="alarmVisible"
          :items="alarmItems"
          :active-id="activeAlarmId"
          @close="alarmVisible = false"
          @locate="handleAlarmLocate"
        />
      </div>

      <aside class="cd-side">
        <!-- 全国视角：KPI 面板 + 汇总 -->
        <template v-if="level === 'national'">
          <div class="cd-kpi-panel">
            <h6 class="cd-side-title">各省发电量分布</h6>
            <cm-bar></cm-bar>
          </div>
          <div class="cd-kpi-panel">
            <h6 class="cd-side-title">实时指标</h6>
            <cm-gauge></cm-gauge>
          </div>
          <div class="cd-summary">
            <div class="cd-summary-item">
              <span class="cd-summary-label">省级行政区</span>
              <span class="cd-summary-value">35</span>
            </div>
            <div class="cd-summary-item">
              <span class="cd-summary-label">可下钻省份</span>
              <span class="cd-summary-value">{{ provinceOptions.length }}</span>
            </div>
            <p class="cd-summary-tip">地图上点击任意省份，下钻到该省城市级发电量地图。</p>
          </div>
        </template>

        <!-- 省份视角：TOP10 排行 + 项目明细 -->
        <template v-else>
          <h6 class="cd-side-title">城市{{ metricLabel }}排行 TOP 10</h6>
          <ul class="cd-side-list">
            <li
              v-for="(city, index) in topCities"
              :key="city.adcode"
              class="cd-side-list-item"
              :class="{ 'is-active': city.name === selectedCity?.name }"
              @click="handleCityClick(city)"
              @mouseenter="dashboardService.highlightCity(city.name)"
              @mouseleave="dashboardService.downplayCity(city.name)"
            >
              <span class="cd-side-list-rank" :class="'cd-side-list-rank--' + (index + 1)">{{ index + 1 }}</span>
              <span class="cd-side-list-name">{{ city.name }}</span>
              <span class="cd-side-list-bar-track">
                <span class="cd-side-list-bar" :style="{ width: powerPercent(city) + '%' }"></span>
              </span>
              <span class="cd-side-list-value">{{ metricValueOf(city) }}</span>
            </li>
          </ul>
          <div class="cd-side-detail">
            <h6 class="cd-side-detail-title">
              {{ selectedCity ? selectedCity.name + ' · 项目明细' : currentProvinceName + ' · 全省汇总' }}
            </h6>
            <div class="cd-side-detail-summary">
              <template v-if="selectedCity">
                <div class="cd-side-detail-summary-item">
                  <span class="cd-side-detail-summary-label">发电量</span>
                  <span class="cd-side-detail-summary-value">{{ selectedCity.power }} GWh</span>
                </div>
                <div class="cd-side-detail-summary-item">
                  <span class="cd-side-detail-summary-label">项目数</span>
                  <span class="cd-side-detail-summary-value">{{ selectedCity.projectCount }}</span>
                </div>
                <div class="cd-side-detail-summary-item">
                  <span class="cd-side-detail-summary-label">告警数</span>
                  <span class="cd-side-detail-summary-value">{{ selectedCity.alarmCount }}</span>
                </div>
              </template>
              <template v-else>
                <div class="cd-side-detail-summary-item">
                  <span class="cd-side-detail-summary-label">城市数</span>
                  <span class="cd-side-detail-summary-value">{{ provinceSummary.cityCount }}</span>
                </div>
                <div class="cd-side-detail-summary-item">
                  <span class="cd-side-detail-summary-label">总发电量</span>
                  <span class="cd-side-detail-summary-value">{{ provinceSummary.totalPower }} GWh</span>
                </div>
                <div class="cd-side-detail-summary-item">
                  <span class="cd-side-detail-summary-label">项目 / 告警</span>
                  <span class="cd-side-detail-summary-value">{{ provinceSummary.projectCount }} / {{ provinceSummary.alarmCount }}</span>
                </div>
              </template>
            </div>
            <ul class="cd-side-detail-list">
              <li
                v-for="project in detailProjects"
                :key="project.id"
                class="cd-side-detail-list-item"
                :class="{ 'is-alarm': project.alarm }"
              >
                <i class="cd-side-detail-list-dot"></i>
                <span class="cd-side-detail-list-name">{{ project.name }}</span>
                <span class="cd-side-detail-list-state">{{ project.alarm ? '告警' : '正常' }}</span>
              </li>
              <li v-if="!detailProjects.length" class="cd-side-detail-list-empty">暂无项目</li>
            </ul>
          </div>
        </template>
      </aside>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import ChartDashboardService, { CityStat, ProjectInfo } from './chart-dashboard.service'
import type { MetricKey, SearchPlace, TimeRangeKey } from './chart-dashboard.service'
import type { AlarmItem } from './components/cm-alarm-center.vue'
import mapConfig from './map/map-config.json'
import CmBar from './components/cm-bar.vue'
import CmGauge from './components/cm-gauge.vue'
import CmControls from './components/cm-controls.vue'
import CmAlarmCenter from './components/cm-alarm-center.vue'

defineOptions({ name: 'ChartDashboard' })

const dashboardService = new ChartDashboardService()

const level = dashboardService.level
const currentProvinceName = dashboardService.currentProvinceName
const currentAdcode = dashboardService.currentAdcode

const provinceOptions = ChartDashboardService.provinceOptions
const profitLabels = ChartDashboardService.profitLabels
const metric = dashboardService.metric
const timeRange = dashboardService.timeRange
const metricOptions = ChartDashboardService.metricOptions
const timeRangeOptions = ChartDashboardService.timeRangeOptions
const metricLabel = computed(
  () => metricOptions.find((item) => item.value === metric.value)?.label ?? '发电量',
)
const profitLegend = [
  { state: 1, label: profitLabels[1], icon: (mapConfig as any).mark.deficit },
  { state: 2, label: profitLabels[2], icon: (mapConfig as any).mark.low },
  { state: 3, label: profitLabels[3], icon: (mapConfig as any).mark.middle },
  { state: 4, label: profitLabels[4], icon: (mapConfig as any).mark.high },
]

const rankedCities = ref<CityStat[]>([])
const selectedCity = ref<CityStat | null>(null)

/** 地图浮层状态 */
const mapWrapRef = ref<HTMLElement | null>(null)
const alarmVisible = ref(false)
const activeAlarmId = ref('')
const isFullscreen = ref(false)

const metricValueOf = (city: CityStat) => {
  switch (metric.value) {
    case 'projectCount':
      return city.projectCount
    case 'alarmCount':
      return city.alarmCount
    default:
      return city.power
  }
}

const maxPower = computed(() =>
  rankedCities.value.reduce((max, city) => Math.max(max, metricValueOf(city)), 1),
)
const powerPercent = (city: CityStat) => Math.round((metricValueOf(city) / maxPower.value) * 100)
const topCities = computed(() =>
  [...rankedCities.value].sort((a, b) => metricValueOf(b) - metricValueOf(a)).slice(0, 10),
)

const alarmItems = ref<AlarmItem[]>([])
/**
 * 告警列表不是纯派生值：service 内部的 version 计数在切指标 / 时间 / 下钻时自增，
 * 只有读到它才会重算，所以用 watch 显式订阅，而不是 computed 里丢一个"为了建依赖"的读操作。
 */
const refreshAlarms = () => {
  if (level.value === 'national') {
    alarmItems.value = dashboardService.getNationalAlarms().map((item) => ({
      id: String(item.adcode),
      name: item.name,
      sub: `${item.power} GWh`,
      tag: '省级',
    }))
    return
  }
  alarmItems.value = dashboardService.getAlarmProjects().map((project) => ({
    id: project.id,
    name: project.name,
    sub: project.cityName,
    tag: '告警',
  }))
}
watch([level, () => dashboardService.version.value], refreshAlarms, { immediate: true })

const detailProjects = computed<ProjectInfo[]>(() =>
  selectedCity.value
    ? dashboardService.getProjectsByCity(selectedCity.value.name)
    : dashboardService.getAlarmProjects(),
)
const provinceSummary = computed(() => dashboardService.getProvinceSummary())

dashboardService.onCitiesChange = (cities) => {
  rankedCities.value = cities
}
dashboardService.onCitySelect = (city) => {
  selectedCity.value = city
}

// 全国视角下 selector 清空，避免误导
watch(level, (lv) => {
  if (lv === 'national') currentAdcode.value = ''
})

const handleProvinceChange = (adcode: string) => {
  const option = provinceOptions.find((item) => item.adcode === adcode)
  if (!option) return
  dashboardService.drillToProvince(option.adcode, option.name)
}

const handleCityClick = (city: CityStat) => {
  dashboardService.selectCity(city.name === selectedCity.value?.name ? '' : city.name)
}

const handleBackToNational = () => {
  dashboardService.backToNational()
}

const handleMetricChange = (value: MetricKey) => {
  dashboardService.setMetric(value)
}

const handleTimeRangeChange = (value: TimeRangeKey) => {
  dashboardService.setTimeRange(value)
}

const handleSearchSelect = (item: SearchPlace) => {
  dashboardService.focusPlace(item)
}

const handleToggleAlarm = () => {
  alarmVisible.value = !alarmVisible.value
}

const handleAlarmLocate = (item: AlarmItem) => {
  activeAlarmId.value = item.id
  if (level.value === 'national') {
    const province = provinceOptions.find((option) => option.adcode === item.id)
    if (province) dashboardService.drillToProvince(province.adcode, province.name)
    return
  }
  const project = dashboardService.getAlarmProjects().find((entry) => entry.id === item.id)
  if (project) dashboardService.focusProject(project)
}

const handleFullscreenChange = () => {
  isFullscreen.value = Boolean(document.fullscreenElement)
  nextTick(() => dashboardService.resize())
}

const handleToggleFullscreen = async () => {
  const target = mapWrapRef.value
  if (!target) return
  if (document.fullscreenElement) {
    await document.exitFullscreen()
  } else {
    await target.requestFullscreen()
  }
}

const handleResize = () => dashboardService.resize()

onMounted(() => {
  dashboardService.initCharts()
  window.addEventListener('resize', handleResize)
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  dashboardService.dispose()
})
</script>

<style lang="less" scoped>
.chart-dashboard {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  background-image: url('../../../assets/images/echarts/echarts-map-bg.png');
  background-repeat: no-repeat;
  background-size: cover;
  padding: 20px;

  .cd-header {
    position: relative;
    top: 0.2rem;
    width: 100%;
    height: 60px;
    min-height: 60px;
    background-image: url('../../../assets/images/echarts/echarts-map-header-bg.png');
    background-repeat: no-repeat;
    display: flex;
    align-items: center;
    justify-content: center;

    .cd-header-title {
      position: relative;
      text-align: center;
      color: transparent;
      height: 60px;
      line-height: 60px;

      .cd-header-title-text {
        position: relative;
        top: 4px;
        font-size: 34px;
        font-weight: 900;
        letter-spacing: 6px;
        background: linear-gradient(92deg, #0072ff 0%, #00eaff 48.8525390625%, #01aaff 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }

    .cd-header-light {
      position: absolute;
      bottom: -26px;
      background-image: url('../../../assets/images/echarts/echarts-map-header-light.png');
      background-position: 80px center;
      width: 100%;
      height: 56px;
    }

    .cd-header-toolbar {
      position: absolute;
      right: 24px;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      align-items: center;
      gap: 12px;

      .cd-header-hint {
        font-size: 13px;
        color: #9ec9ff;
        letter-spacing: 2px;
      }

      .cd-breadcrumb {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;

        .cd-breadcrumb-item {
          color: #00eaff;
          cursor: pointer;

          &:hover {
            text-decoration: underline;
          }
        }

        .cd-breadcrumb-sep {
          color: #5a7ba8;
        }

        .cd-breadcrumb-current {
          color: #d6e8ff;
        }
      }

      .cd-header-select {
        width: 150px;

        :deep(.el-input__wrapper) {
          background: rgba(6, 39, 65, 0.6);
          box-shadow: 0 0 0 1px rgba(54, 129, 255, 0.4) inset;
        }

        :deep(.el-input__inner) {
          color: #d6e8ff;
        }
      }
    }
  }

  > .cd-body {
    position: relative;
    flex: auto;
    z-index: 10;
    overflow: hidden;
    backface-visibility: hidden;
    display: flex;
    gap: 16px;

    .cd-map-wrap {
      position: relative;
      flex: 1;
      min-width: 0;

      .cd-map-container {
        width: 100%;
        height: 100%;
      }

      .cd-map-legend {
        position: absolute;
        top: 12px;
        left: 12px;
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 8px 14px;
        background: rgba(6, 39, 65, 0.55);
        border: 1px solid rgba(54, 129, 255, 0.22);
        border-radius: var(--ai-radius-sm);
        font-size: 12px;
        color: #d6e8ff;

        .cd-map-legend-title {
          color: #9ec9ff;
          letter-spacing: 1px;
        }

        .cd-map-legend-item {
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .cd-map-legend-icon {
          width: 16px;
          height: 22px;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;

          &--alarm {
            width: 13px;
            height: 12px;
            border-radius: 50%;
            background-color: #ff3f00;
            box-shadow: 0 0 6px #ff3f00;
          }
        }
      }
    }

    .cd-side {
      width: 320px;
      min-width: 320px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 14px;
      box-sizing: border-box;
      background-image: linear-gradient(to right, rgba(170, 184, 206, 0.1), rgba(122, 150, 251, 0.1));
      border: 1px solid rgba(54, 129, 255, 0.18);
      border-radius: var(--ai-radius-md);
      backdrop-filter: blur(4px);
      overflow: hidden;

      .cd-side-title {
        margin: 0 0 8px;
        font-size: 14px;
        font-weight: 600;
        color: #d6e8ff;
        letter-spacing: 1px;
      }

      .cd-kpi-panel {
        display: flex;
        flex-direction: column;
        background: rgba(6, 39, 65, 0.35);
        border-radius: var(--ai-radius-sm);
        padding: 10px;

        :deep(.cm-bar),
        :deep(.cm-gauge) {
          height: 180px;
        }
      }

      .cd-summary {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding-top: 6px;

        .cd-summary-item {
          flex: 1 1 40%;
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 8px;
          border-radius: var(--ai-radius-sm);
          background: rgba(6, 39, 65, 0.45);

          .cd-summary-label {
            font-size: 11px;
            color: #9ec9ff;
          }

          .cd-summary-value {
            font-size: 18px;
            font-weight: 600;
            color: #7fe3f0;
            font-variant-numeric: tabular-nums;
          }
        }

        .cd-summary-tip {
          flex: 1 1 100%;
          margin: 4px 0 0;
          font-size: 12px;
          color: #9ec9ff;
          line-height: 1.6;
        }
      }

      .cd-side-list {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        margin: 0;
        padding: 0;
        list-style: none;

        .cd-side-list-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 8px;
          border-radius: var(--ai-radius-sm);
          cursor: pointer;
          transition: background 0.2s;

          &:hover,
          &.is-active {
            background: rgba(54, 129, 255, 0.18);
          }

          .cd-side-list-rank {
            width: 18px;
            height: 18px;
            line-height: 18px;
            text-align: center;
            font-size: 12px;
            border-radius: var(--ai-radius-xxs);
            color: #9ec9ff;
            background: rgba(54, 129, 255, 0.2);

            &--1,
            &--2,
            &--3 {
              color: #ffffff;
              background: linear-gradient(135deg, #0072ff, #00eaff);
            }
          }

          .cd-side-list-name {
            width: 76px;
            font-size: 12px;
            color: #d6e8ff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .cd-side-list-bar-track {
            flex: 1;
            height: 6px;
            border-radius: 3px;
            background: rgba(54, 129, 255, 0.15);
            overflow: hidden;
          }

          .cd-side-list-bar {
            display: block;
            height: 100%;
            border-radius: 3px;
            background: linear-gradient(90deg, #0072ff, #00eaff);
          }

          .cd-side-list-value {
            width: 52px;
            text-align: right;
            font-size: 12px;
            color: #7fe3f0;
            font-variant-numeric: tabular-nums;
          }
        }
      }

      .cd-side-detail {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding-top: 12px;
        border-top: 1px solid rgba(54, 129, 255, 0.25);

        .cd-side-detail-title {
          margin: 0;
          font-size: 13px;
          font-weight: 600;
          color: #d6e8ff;
        }

        .cd-side-detail-summary {
          display: flex;
          gap: 10px;

          .cd-side-detail-summary-item {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 2px;
            padding: 8px;
            border-radius: var(--ai-radius-sm);
            background: rgba(6, 39, 65, 0.45);

            .cd-side-detail-summary-label {
              font-size: 11px;
              color: #9ec9ff;
            }

            .cd-side-detail-summary-value {
              font-size: 15px;
              font-weight: 600;
              color: #7fe3f0;
              font-variant-numeric: tabular-nums;
            }
          }
        }

        .cd-side-detail-list {
          flex: 1;
          min-height: 80px;
          max-height: 180px;
          overflow-y: auto;
          margin: 0;
          padding: 0;
          list-style: none;

          .cd-side-detail-list-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 5px 4px;
            font-size: 12px;
            color: #d6e8ff;

            &.is-alarm {
              color: #ff9c6e;

              .cd-side-detail-list-dot {
                background: #ff3f00;
                box-shadow: 0 0 6px #ff3f00;
              }
            }

            .cd-side-detail-list-dot {
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background: #35b8e8;
            }

            .cd-side-detail-list-name {
              flex: 1;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .cd-side-detail-list-state {
              font-size: 11px;
              color: #9ec9ff;
            }
          }

          .cd-side-detail-list-empty {
            padding: 12px 4px;
            font-size: 12px;
            color: #9ec9ff;
            text-align: center;
          }
        }
      }
    }
  }
}
</style>

<style lang="less">
.cd-province-select-popper {
  background: rgba(6, 39, 65, 0.95);
  border: 1px solid rgba(54, 129, 255, 0.4);

  .el-select-dropdown__item {
    color: #d6e8ff;
  }

  .el-select-dropdown__item.is-hovering,
  .el-select-dropdown__item:hover {
    background: rgba(54, 129, 255, 0.25);
  }

  .el-select-dropdown__item.is-selected {
    color: #00eaff;
  }

  .popper__arrow {
    background: rgba(6, 39, 65, 0.95);
  }
}
</style>
