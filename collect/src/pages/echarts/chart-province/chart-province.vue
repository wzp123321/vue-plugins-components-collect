<template>
  <div class="chart-province">
    <div class="cp-header">
      <div class="cp-header-title"><span class="cp-header-title-text">城市能源地图</span></div>
      <div class="cp-header-light"></div>
      <div class="cp-header-toolbar">
        <span class="cp-header-toolbar-label">省份</span>
        <el-select
          v-model="currentAdcode"
          class="cp-header-toolbar-select"
          size="small"
          popper-class="cp-province-select-popper"
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
    <div class="cp-body">
      <div class="cp-map-wrap">
        <div class="cp-map-container" :id="chartProvinceService.customChartId"></div>
        <div class="cp-map-legend">
          <span class="cp-map-legend-title">盈利状态</span>
          <span
            v-for="item in profitLegend"
            :key="item.state"
            class="cp-map-legend-item"
          >
            <i class="cp-map-legend-icon" :style="{ backgroundImage: `url(${item.icon})` }"></i>
            {{ item.label }}
          </span>
          <span class="cp-map-legend-item">
            <i class="cp-map-legend-icon cp-map-legend-icon--alarm"></i>告警
          </span>
        </div>
      </div>
      <aside class="cp-side">
        <h6 class="cp-side-title">城市发电量排行 TOP 10</h6>
        <ul class="cp-side-list">
          <li
            v-for="(city, index) in topCities"
            :key="city.adcode"
            class="cp-side-list-item"
            :class="{ 'is-active': city.name === selectedCity?.name }"
            @click="handleCityClick(city)"
            @mouseenter="chartProvinceService.highlightCity(city.name)"
            @mouseleave="chartProvinceService.downplayCity(city.name)"
          >
            <span class="cp-side-list-rank" :class="'cp-side-list-rank--' + (index + 1)">{{ index + 1 }}</span>
            <span class="cp-side-list-name">{{ city.name }}</span>
            <span class="cp-side-list-bar-track">
              <span class="cp-side-list-bar" :style="{ width: powerPercent(city) + '%' }"></span>
            </span>
            <span class="cp-side-list-value">{{ city.power }}</span>
          </li>
        </ul>
        <div class="cp-side-detail">
          <h6 class="cp-side-detail-title">
            {{ selectedCity ? selectedCity.name + ' · 项目明细' : '全省汇总' }}
          </h6>
          <div class="cp-side-detail-summary">
            <template v-if="selectedCity">
              <div class="cp-side-detail-summary-item">
                <span class="cp-side-detail-summary-label">发电量</span>
                <span class="cp-side-detail-summary-value">{{ selectedCity.power }} GWh</span>
              </div>
              <div class="cp-side-detail-summary-item">
                <span class="cp-side-detail-summary-label">项目数</span>
                <span class="cp-side-detail-summary-value">{{ selectedCity.projectCount }}</span>
              </div>
              <div class="cp-side-detail-summary-item">
                <span class="cp-side-detail-summary-label">告警数</span>
                <span class="cp-side-detail-summary-value">{{ selectedCity.alarmCount }}</span>
              </div>
            </template>
            <template v-else>
              <div class="cp-side-detail-summary-item">
                <span class="cp-side-detail-summary-label">城市数</span>
                <span class="cp-side-detail-summary-value">{{ provinceSummary.cityCount }}</span>
              </div>
              <div class="cp-side-detail-summary-item">
                <span class="cp-side-detail-summary-label">总发电量</span>
                <span class="cp-side-detail-summary-value">{{ provinceSummary.totalPower }} GWh</span>
              </div>
              <div class="cp-side-detail-summary-item">
                <span class="cp-side-detail-summary-label">项目 / 告警</span>
                <span class="cp-side-detail-summary-value">{{ provinceSummary.projectCount }} / {{ provinceSummary.alarmCount }}</span>
              </div>
            </template>
          </div>
          <ul class="cp-side-detail-list">
            <li
              v-for="project in detailProjects"
              :key="project.id"
              class="cp-side-detail-list-item"
              :class="{ 'is-alarm': project.alarm }"
            >
              <i class="cp-side-detail-list-dot"></i>
              <span class="cp-side-detail-list-name">{{ project.name }}</span>
              <span class="cp-side-detail-list-state">{{ project.alarm ? '告警' : '正常' }}</span>
            </li>
            <li v-if="!detailProjects.length" class="cp-side-detail-list-empty">暂无项目</li>
          </ul>
        </div>
      </aside>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, ref } from 'vue';
import ChartProvinceService, { CP_ICityStat } from './chart-province.service';
import mapConfig from './map/map-config.json';

export default defineComponent({
  name: 'ChartProvince',
  setup() {
    const chartProvinceService = new ChartProvinceService();

    const provinceOptions = ChartProvinceService.provinceOptions;
    const profitLabels = ChartProvinceService.profitLabels;
    const profitLegend = [
      { state: 1, label: profitLabels[1], icon: mapConfig.mark.deficit },
      { state: 2, label: profitLabels[2], icon: mapConfig.mark.low },
      { state: 3, label: profitLabels[3], icon: mapConfig.mark.middle },
      { state: 4, label: profitLabels[4], icon: mapConfig.mark.high },
    ];

    const currentAdcode = ref('510000');
    const rankedCities = ref<CP_ICityStat[]>([]);
    const selectedCity = ref<CP_ICityStat | null>(null);

    const maxPower = computed(() =>
      rankedCities.value.reduce((max, city) => Math.max(max, city.power), 1),
    );
    const powerPercent = (city: CP_ICityStat) => Math.round((city.power / maxPower.value) * 100);
    const topCities = computed(() => rankedCities.value.slice(0, 10));

    const detailProjects = computed(() =>
      selectedCity.value
        ? chartProvinceService.getProjectsByCity(selectedCity.value.name)
        : chartProvinceService.getAlarmProjects(),
    );
    const provinceSummary = computed(() => chartProvinceService.getProvinceSummary());

    chartProvinceService.onCitiesChange = (cities) => {
      rankedCities.value = cities;
    };
    chartProvinceService.onCitySelect = (city) => {
      selectedCity.value = city;
    };

    const handleProvinceChange = (adcode: string) => {
      const option = provinceOptions.find((item) => item.adcode === adcode);
      if (!option) return;
      chartProvinceService.switchProvince(option.adcode, option.name);
    };

    const handleCityClick = (city: CP_ICityStat) => {
      // 再次点击同一城市 → 回到全省视图
      chartProvinceService.selectCity(city.name === selectedCity.value?.name ? '' : city.name);
    };

    const handleResize = () => {
      chartProvinceService.resize();
    };

    onMounted(() => {
      chartProvinceService.initCharts();
      window.addEventListener('resize', handleResize);
    });
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize);
      chartProvinceService.dispose();
    });

    return {
      chartProvinceService,
      provinceOptions,
      profitLegend,
      currentAdcode,
      rankedCities,
      topCities,
      selectedCity,
      detailProjects,
      powerPercent,
      provinceSummary,
      handleProvinceChange,
      handleCityClick,
    };
  },
});
</script>

<style lang="less" scoped>
.chart-province {
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

  .cp-header {
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

    .cp-header-title {
      position: relative;
      text-align: center;
      background-size: cover;
      color: transparent;
      height: 60px;
      line-height: 60px;

      .cp-header-title-text {
        position: relative;
        top: 4px;
        font-size: 34px;
        font-weight: 900;
        letter-spacing: 6px;
        width: 100%;
        background: linear-gradient(92deg, #0072ff 0%, #00eaff 48.8525390625%, #01aaff 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }

    .cp-header-light {
      position: absolute;
      bottom: -26px;
      background-image: url('../../../assets/images/echarts/echarts-map-header-light.png');
      background-position: 80px center;
      width: 100%;
      height: 56px;
    }

    .cp-header-toolbar {
      position: absolute;
      right: 24px;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      align-items: center;
      gap: 8px;

      .cp-header-toolbar-label {
        font-size: 14px;
        color: #9ec9ff;
        letter-spacing: 2px;
      }

      .cp-header-toolbar-select {
        width: 160px;

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

  > .cp-body {
    position: relative;
    flex: auto;
    z-index: 10;
    overflow: hidden;
    backface-visibility: hidden;
    display: flex;
    gap: 16px;

    .cp-map-wrap {
      position: relative;
      flex: 1;
      min-width: 0;

      .cp-map-container {
        width: 100%;
        height: 100%;
      }

      .cp-map-legend {
        position: absolute;
        top: 12px;
        left: 12px;
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 8px 14px;
        background: rgba(6, 39, 65, 0.55);
        border: 1px solid rgba(54, 129, 255, 0.35);
        border-radius: 4px;
        font-size: 12px;
        color: #d6e8ff;

        .cp-map-legend-title {
          color: #9ec9ff;
          letter-spacing: 1px;
        }

        .cp-map-legend-item {
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .cp-map-legend-icon {
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

    .cp-side {
      width: 300px;
      min-width: 300px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 14px;
      box-sizing: border-box;
      background-image: linear-gradient(to right, rgba(170, 184, 206, 0.1), rgba(122, 150, 251, 0.1));
      border-radius: 4px;
      backdrop-filter: blur(4px);

      .cp-side-title {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        color: #d6e8ff;
        letter-spacing: 1px;
      }

      .cp-side-list {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        margin: 0;
        padding: 0;
        list-style: none;

        .cp-side-list-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 8px;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;

          &:hover,
          &.is-active {
            background: rgba(54, 129, 255, 0.18);
          }

          .cp-side-list-rank {
            width: 18px;
            height: 18px;
            line-height: 18px;
            text-align: center;
            font-size: 12px;
            border-radius: 2px;
            color: #9ec9ff;
            background: rgba(54, 129, 255, 0.2);

            &--1,
            &--2,
            &--3 {
              color: #ffffff;
              background: linear-gradient(135deg, #0072ff, #00eaff);
            }
          }

          .cp-side-list-name {
            width: 76px;
            font-size: 12px;
            color: #d6e8ff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .cp-side-list-bar-track {
            flex: 1;
            height: 6px;
            border-radius: 3px;
            background: rgba(54, 129, 255, 0.15);
            overflow: hidden;
          }

          .cp-side-list-bar {
            display: block;
            height: 100%;
            border-radius: 3px;
            background: linear-gradient(90deg, #0072ff, #00eaff);
          }

          .cp-side-list-value {
            width: 52px;
            text-align: right;
            font-size: 12px;
            color: #7fe3f0;
            font-variant-numeric: tabular-nums;
          }
        }
      }

      .cp-side-detail {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding-top: 12px;
        border-top: 1px solid rgba(54, 129, 255, 0.25);

        .cp-side-detail-title {
          margin: 0;
          font-size: 13px;
          font-weight: 600;
          color: #d6e8ff;
        }

        .cp-side-detail-summary {
          display: flex;
          gap: 10px;

          .cp-side-detail-summary-item {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 2px;
            padding: 8px;
            border-radius: 4px;
            background: rgba(6, 39, 65, 0.45);

            .cp-side-detail-summary-label {
              font-size: 11px;
              color: #9ec9ff;
            }

            .cp-side-detail-summary-value {
              font-size: 15px;
              font-weight: 600;
              color: #7fe3f0;
              font-variant-numeric: tabular-nums;
            }
          }
        }

        .cp-side-detail-list {
          flex: 1;
          min-height: 80px;
          max-height: 180px;
          overflow-y: auto;
          margin: 0;
          padding: 0;
          list-style: none;

          .cp-side-detail-list-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 5px 4px;
            font-size: 12px;
            color: #d6e8ff;

            &.is-alarm {
              color: #ff9c6e;

              .cp-side-detail-list-dot {
                background: #ff3f00;
                box-shadow: 0 0 6px #ff3f00;
              }
            }

            .cp-side-detail-list-dot {
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background: #35b8e8;
            }

            .cp-side-detail-list-name {
              flex: 1;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .cp-side-detail-list-state {
              font-size: 11px;
              color: #9ec9ff;
            }
          }

          .cp-side-detail-list-empty {
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
/* el-select 下拉弹窗挂在 body 下，scoped 样式无法覆盖，需全局定义 */
.cp-province-select-popper {
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
