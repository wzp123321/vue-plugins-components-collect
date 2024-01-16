<template>
  <div class="ea-office-energy-decompose" v-loading="service.loading.value">
    <div class="eoed-content">
      <div class="eoed-pi" v-show="!isShowNoData">
        <div class="eoed-header-title">
          <div class="eoed-name">总计</div>
          <div class="eoed-value">
            {{ service.pieTotal.value === null ? '--' : thousandSeparation(Number(service.pieTotal.value)) }}
          </div>
          <div class="eoed-unit">{{ service.unit.value }}</div>
        </div>
        <div id="pie-echart"></div>
        <div class="eoed-pie-title">
          <span class="eoed-line"></span>{{ service.pieTitle.value }}<span class="eoed-line"></span>
        </div>
      </div>
      <div class="eoed-table-container" v-show="!isShowNoData">
        <div class="eoed-select-label">
          <div class="flex-row-start-center flex-wrap">
            <img src="../../../../../assets/img/common/common-home-icon.svg" @click="homeDrillClick" alt="home" />
            <span v-for="(item, index) in service.dataDrillingNameArr.value" :key="index" class="flex-row-start-center">
              <svg
                style="margin-left: 8px"
                class="icon"
                height="12"
                p-id="7730"
                t="1611208675851"
                version="1.1"
                viewBox="0 0 1024 1024"
                width="12"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  _ngcontent-fxr-c13=""
                  d="M175.396571 128.731429a8.045714 8.045714 0 0 0-4.169142 4.242285l-0.585143 2.998857v82.212572c0 3.072 0.877714 5.997714 2.486857 8.557714l2.925714 3.437714 322.56 287.963429-322.56 287.963429a16.018286 16.018286 0 0 0-4.754286 7.460571l-0.658285 4.461714v82.212572a8.045714 8.045714 0 0 0 2.194285 5.558857l2.56 1.755428 2.925715 0.731429 3.072-0.512 2.633143-1.536 407.917714-364.251429a31.963429 31.963429 0 0 0 2.56-45.202285l-1.243429-1.316572-1.316571-1.243428-407.917714-364.251429-2.633143-1.462857-2.998857-0.512z m272.018286 0a8.045714 8.045714 0 0 0-4.169143 4.242285l-0.585143 2.998857v82.212572c0 3.072 0.877714 5.997714 2.486858 8.557714l2.925714 3.437714 322.56 287.963429-322.56 287.963429a16.018286 16.018286 0 0 0-4.754286 7.460571l-0.658286 4.461714v82.212572a8.045714 8.045714 0 0 0 2.194286 5.558857l2.56 1.755428 2.925714 0.731429 2.998858-0.512 2.633142-1.536 407.990858-364.251429a31.963429 31.963429 0 0 0 2.56-45.202285l-1.243429-1.316572-1.316571-1.243428-407.990858-364.251429-2.633142-1.462857-2.925715-0.512z"
                  fill="#000000"
                  opacity=".65"
                  p-id="7731"
                ></path>
              </svg>
              <span class="eoed-crumbs-name" @click="drillNameClick(item, index)">{{ item.name }}</span>
            </span>
          </div>
          <drilling-table
            :table-data="service.tableData.value"
            :table-head="service.tableHead.value"
            :lastMonthDate="service.lastMonthDate.value"
            :lastYearDate="service.lastYearDate.value"
            :table-data-object="service.pieData"
            :is-leaf-value="service.isLeafValue.value"
            @object-name-click="toQuery"
          ></drilling-table>
        </div>
      </div>
    </div>
    <no-data v-show="isShowNoData"></no-data>
  </div>
</template>
<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import EchartsConfig from '@/config/echarts/index';
import { EChartsOption, format, init, ECharts } from 'echarts';
import { ItemCode, OfficeDecomposeService } from './ea-office-energy-decompose.service';
import { useStore } from 'vuex';
import DrillingTable from './components/eoed-table.vue';
import { thousandSeparation } from '@/utils/index';
import { useCommonController } from '@/utils/use-common-controller';
import { debounce } from 'lodash';

const { emitter } = useCommonController();
const service = new OfficeDecomposeService();
let myEchart: ECharts | null = null;
const isShowNoData = ref(false);

onMounted(() => {
  emitter.on(
    'search-office-global',
    debounce((searchParam: any) => {
      service.dataDrillingNameArr.value = [];
      myEchart?.clear();
      if (!myEchart) {
        nextTick(() => {
          myEchart = init(document.getElementById('pie-echart')!);
          myEchart.off('click');
          myEchart.on('click', 'series.pie', (params: any) => {
            if (service.isLeafValue.value) {
              return;
            }
            service.pieParams.treeId = params.data.id;
            service.query().then((tag: boolean) => {
              myEchart?.setOption(getPieEchartsOption());
              myEchart?.resize();
              if (tag) {
                service.dataDrillingNameArr.value.push({
                  id: params.data.id ?? 0,
                  name: params.data.name ?? '',
                  value: service.isLeafValue.value ? params?.data?.departmentValue : params.data.value ?? '',
                  percent: params.data.percent ?? '',
                  hasChild: params?.data?.hasChild ?? false,
                  departmentValue: params?.data?.departmentValue ?? null,
                  departmentPercent: params?.data?.departmentPercent ?? null,
                });
              }
            });
          });
          window.onresize = () => {
            if (myEchart) {
              myEchart?.resize();
            }
          };
        });
      }
      service.pieParams.startTime = searchParam.startTime.split(' ')[0];
      service.pieParams.endTime = searchParam.endTime.split(' ')[0];
      service.pieParams.energyCode = searchParam.energyCode;
      service.pieParams.treeId = searchParam.treeId;
      service.parentTreeId = searchParam.treeId;
      service.query().then((tag: boolean) => {
        if (!tag) {
          isShowNoData.value = true;
        } else {
          isShowNoData.value = false;
        }
        myEchart?.setOption(getPieEchartsOption());
        nextTick(() => {
          myEchart?.resize();
        });
      });
    }, 300),
  );
});
onUnmounted(() => {
  window.onresize = null;
  emitter.off('search-office-global');

  if (myEchart) {
    myEchart?.dispose();
  }
});

const store = useStore();
const theme = computed(() => {
  return store.getters.theme || 'light';
});
/**
 * 生成饼图配置
 */
function getPieEchartsOption() {
  const fontColor = EchartsConfig.themeConstant[theme.value].CHARTS_AXIS_TEXT_COLOR;
  const option: EChartsOption = {
    color: EchartsConfig.echartsConstant.CHARTS_PIE_MAIN_COLOR,
    tooltip: Object.assign(EchartsConfig.echartsOption(theme.value).ECHARTS_TOOLTIP_OPTION, {
      borderColor: 'transparent',
      formatter: (params: any) => {
        return `<div style="text-align:left;box-sizing: border-box;border-radius: 4px;max-width: 300px;word-break:break-all;word-wrap:break-word;white-space:normal">
                  <div style="text-align:left;font-size:14px;box-sizing: border-box;max-width: 300px;word-break:break-all;word-wrap:break-word;white-space:normal">
                    ${params?.name ?? '--'}
                  </div>
                  <div style="text-align:left;font-size:14px;box-sizing: border-box;margin-top: 4px;">
                    <span>${service.energyType.value}：</span>
                    <span>${thousandSeparation(params?.value) ?? '--'} </span>
                    <span>${service.unit.value}</span>
                  </div>
                </div>`;
      },
    }),
    legend: Object.assign(EchartsConfig.echartsOption(theme.value).ECHARTS_LINECHART_LEGEND_OPTION, {
      type: 'scroll',
      orient: 'vertical',
      top: 50,
      right: 50,
      bottom: 30,
      itemGap: 20,
      itemWidth: 20,
      itemHeight: 8,
      selectedMode: true,
      pageIconSize: 14,
      // 处理图例过长
      formatter: (name: any) => {
        return format.truncateText(name, 140, '14px Microsoft Yahei', '…', {});
      },
      tooltip: {
        show: true,
        backgroundColor: EchartsConfig.echartsConstant.CHARTS_TOOLTIP_BG_COLOR,
        textStyle: {
          color: '#fff',
          fontSize: EchartsConfig.echartsConstant.CHARTS_FONT_SIZE_14,
        },
        padding: [8, 8],
        formatter: '{a}',
      },
    }),
    series: [
      {
        type: 'pie',
        startAngle: 120,
        avoidLabelOverlap: true,
        radius: ['30%', '50%'],
        center: ['40%', '50%'],
        label: {
          formatter: (params: any) => {
            return `${
              params?.data?.percent !== null && params?.data?.percent !== undefined ? `${params?.data?.percent}%` : '0%'
            }`;
          },
          borderWidth: 20,
          borderRadius: 4,
          padding: [0, -48, 20, -48],
          rich: {
            a: {
              color: fontColor,
              fontSize: 12,
              lineHeight: 20,
            },
            b: {
              color: fontColor,
              fontSize: 12,
              lineHeight: 20,
            },
          },
        },
        // 延伸线
        labelLine: {
          length: 10,
          length2: 50,
        },
        data: resetData(service.pieData),
        emphasis: {
          itemStyle: {
            borderWidth: 20,
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };
  return option;
}
/**
 * series-数据
 * @param data
 */
function resetData(data: ItemCode[]) {
  const arr: any[] = [];
  data.forEach((item: ItemCode, index: number) => {
    const arrItem = {
      id: item.id,
      value: service.isLeafValue.value ? item.departmentValue : item.value,
      percent: item.percent,
      name: EchartsConfig.echartsUtils.resetName(index + 1, item.name ?? '') ?? '',
      avoidLabelOverlap: false,
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color:
                EchartsConfig.echartsConstant.CHARTS_DOUGHNUT_MAIN_COLOR[
                  index % EchartsConfig.echartsConstant.CHARTS_DOUGHNUT_MAIN_COLOR.length
                ][0], // 0% 处的颜色
            },
            {
              offset: 1,
              color:
                EchartsConfig.echartsConstant.CHARTS_DOUGHNUT_MAIN_COLOR[
                  index % EchartsConfig.echartsConstant.CHARTS_DOUGHNUT_MAIN_COLOR.length
                ][1], // 100% 处的颜色
            },
          ],
          global: false, // 缺省为 false
        },
      },
    };
    arr.push(arrItem);
  });
  return arr;
}
/**
 * 回到顶级
 */
function homeDrillClick() {
  service.pieParams.treeId = service.parentTreeId;
  service.query().then((tag: boolean) => {
    myEchart?.setOption(getPieEchartsOption());
    myEchart?.resize();
    if (tag) {
      service.dataDrillingNameArr.value = [];
    }
  });
}
/**
 * 表格钻取
 * @param item
 * @param index
 */
function drillNameClick(item: ItemCode, index: number) {
  service.pieParams.treeId = item.id;
  service.query().then((tag: boolean) => {
    myEchart?.setOption(getPieEchartsOption());
    myEchart?.resize();
    service.dataDrillingNameArr.value.splice(index + 1);
  });
}

function toQuery(data: any) {
  service.pieParams.treeId = data.id;
  service.query().then((tag: boolean) => {
    myEchart?.setOption(getPieEchartsOption());
    myEchart?.resize();
    if (tag) {
      service.dataDrillingNameArr.value.push(service.currentPieData[data.index]);
    }
  });
}
</script>
<style lang="less" scoped>
.ea-office-energy-decompose {
  flex: auto;
  width: 100%;

  .eoed-content {
    display: grid;
    grid-template-columns: 50% 50%;
  }
  .eoed-pi {
    padding-right: 12px;
    position: relative;
    .eoed-header-title {
      display: flex;
      align-items: center;
      margin-top: 20px;
      .eoed-name {
        color: var(--iot-font-color-root);
        font-size: 14px;
        margin-right: 13px;
      }

      .eoed-value {
        color: #1890ff;
        font-size: 20px;
      }

      .eoed-unit {
        color: #1890ff;
        font-size: 20px;
        margin-left: 10px;
      }
    }
    .eoed-pie-title {
      font-size: 16px;
      color: rgb(0, 0, 0);
      position: absolute;
      width: fit-content;
      left: 40%;
      bottom: 0;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 4px;
      .eoed-line {
        display: inline-block;
        width: 8px;
        height: 1px;
        background-color: rgba(24, 144, 255, 1);
      }
    }
  }
  .eoed-table-container {
    padding-top: 22px;
    padding-left: 12px;
    .eoed-select-label {
      img {
        cursor: pointer;
      }
      .eoed-crumbs-name {
        cursor: pointer;
        font-size: 14px;
        color: #1890ff;
        margin-left: 8px;
      }
    }
  }
  #pie-echart {
    height: 328px;
    width: 100%;
  }
}
</style>
