<template>
  <home-component-container :headTitle="title">
    <template v-slot:header>
      <button text @click="linkToDetailPage">详情</button>
    </template>
    <template v-slot:box>
      <div class="home-energy-sub-item">
        <div class="hesi-back" v-if="treeIds.length > 1">
          <el-button type="primary" @click="backTo">返回上级</el-button>
        </div>
        <div class="hesi-switch" v-if="!hesiSerivce.noConfig.flag">
          <span
            :class="item.code === hesiSerivce.queryParams.energyCode ? 'selected' : ''"
            v-for="item in hesiSerivce.energyTypeList"
            :key="item.code"
            @click="selectEnergyCode(item.code)"
            >{{ item.name }}</span
          >
        </div>
        <div
          class="hesi-echart"
          ref="echartRef"
          v-loading="hesiSerivce.loading"
          v-show="!hesiSerivce.noData.flag && !hesiSerivce.noConfig.flag"
        ></div>
        <!-- 无数据时 start -->
        <no-data
          :title="hesiSerivce.noData.msg"
          v-if="!hesiSerivce.loading && hesiSerivce.noData.flag && !hesiSerivce.noConfig.flag"
        ></no-data>
        <!-- 无数据时 end -->
        <!-- 无配置时 start -->
        <no-data
          :imgUrl="noConfigImg"
          :title="hesiSerivce.noConfig.msg"
          v-if="!hesiSerivce.loading && !hesiSerivce.noData.flag && hesiSerivce.noConfig.flag"
        ></no-data>
      </div>
      <!-- 无配置时 end -->
    </template>
  </home-component-container>
</template>

<script lang="ts" setup>
//服务
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
import HomeEnergySubItemService from './home-energy-sub-item.service';
import { init, EChartsOption, format, EChartsType } from 'echarts';
import store from '@/store';
import EchartsConfig from '@/config/echarts/index';
import { HESI_IGenData } from './home-energy-sub-item.api';
import { TitleOption } from 'echarts/types/dist/shared';
import homeComponentContainer from '../home-component-container/home-component-container.vue';
import { getTimeUnitItems, openBlankUrl } from '@/utils';
import { noConfigImg, treeTypeList } from '@/config/config';

const props = defineProps({
  uid: {
    type: Number,
    default: null,
  },
  title: {
    type: String,
    default: '',
  },
  configContent: {
    type: String,
    default: '',
  },
});

const hesiSerivce = new HomeEnergySubItemService();
const echartRef = ref();
const formatUtil: any = format;
const theme = computed(() => {
  return store.getters.theme || 'light';
});

// 获取时间颗粒度
const getTimeUnit = async (date: any) => {
  const timeUnits = await getTimeUnitItems(new Date(date[0]), new Date(date[1]));
  return timeUnits?.length ? timeUnits[0].value : '';
};

const treeType = ref('');
const treeId = ref<null | number>(null);
const linkToDetailPage = async () => {
  const energyCode = hesiSerivce.queryParams.energyCode;
  const date = [new Date(), new Date()];
  const timeUnit = await getTimeUnit(date);
  window.sessionStorage.setItem(
    'ems-analysis-query-params',
    JSON.stringify({
      energyCode: [energyCode],
      date,
      timeUnit,
      treeId: treeId.value,
      treeType: treeType.value,
    }),
  );
  openBlankUrl('/web/energyAnalysis');
};

let myChart: EChartsType;

//字体颜色
const fontColor = EchartsConfig.themeConstant[theme.value].CHARTS_AXIS_TEXT_COLOR;
const titleColor = EchartsConfig.themeConstant[theme.value].PIE_TITLE_TEXT_COLOR;

//配置项
const options = ref<EChartsOption>();

/**
 * 初始化饼图
 */
const initPieChart = async () => {
  // 基于准备好的dom，初始化echarts实例
  const data = await genData();
  if (!echartRef.value || !data.seriesData.length) {
    return;
  }
  if (myChart) {
    myChart?.dispose();
  }
  myChart = init(echartRef.value);
  options.value = {
    title: genTitle(data),
    tooltip: genTooltip(data),
    legend: genLegend(),
    series: genSeries(data),
  };
  myChart.clear(); // 清空绘画内容，清空后实例可用
  myChart.setOption(options.value);
};

/**
 * 饼图标题
 * @param data
 */
const genTitle = (data: HESI_IGenData): TitleOption => {
  return {
    text: ['{a| —}', '{b|  ' + data.pieChartName + '用能分项占比图 }', '{a| —}'].join(''),
    bottom: 10,
    left: '40%',
    textAlign: 'center',
    textStyle: {
      rich: {
        a: {
          color: '#1890ff',
          lineHeight: 1,
          width: 8,
          fontSize: 12,
        },
        b: {
          padding: [0, 4],
          fontSize: 16,
          color: titleColor,
        },
        x: {
          fontSize: 16,
          fontFamily: 'Microsoft YaHei',
        },
      },
    },
  };
};

/**
 * 饼图提示框
 * @param data
 */
const genTooltip = (data: HESI_IGenData) => {
  return Object.assign(EchartsConfig.echartsOption(theme.value).ECHARTS_TOOLTIP_OPTION, {
    trigger: 'item',
    formatter: (params: any) => {
      return `${data.energyName}占比<br/>${params.name}: ${params.value}${data.unit} (${params.percent}%)`;
    },
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    textStyle: {
      color: 'rgba(255, 255, 255, 0.85)',
      fontSize: EchartsConfig.echartsConstant.CHARTS_FONT_SIZE_14,
    },
    borderWidth: 0,
    padding: [8, 8, 8, 8],
  });
};

/**
 * 图例
 */
const genLegend = () => {
  return Object.assign(EchartsConfig.echartsOption(theme.value).ECHARTS_LINECHART_LEGEND_OPTION, {
    type: 'scroll',
    orient: 'vertical',
    height: 280,
    top: 'middle',
    right: 30,
    bottom: 0,
    itemGap: 24,
    itemWidth: 20,
    itemHeight: 8,
    selectedMode: true,
    pageIconSize: 14,
    pageIconInactiveColor: '#d8d8d8',
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
    formatter: (name: any) => {
      // let showText = hesiSerivce.pieChartData?.pieChartDataList.find((v) => v.name === name)?.name;
      return formatUtil.truncateText(name, 164, '14px Microsoft Yahei', '…');
    },
  });
};

/**
 * 数据
 * @param data
 */
const genSeries = (data: HESI_IGenData): any => {
  return [
    {
      type: 'pie',
      name: data.energyName + '占比',
      data: data.seriesData,
      startAngle: 90,
      avoidLabelOverlap: true,
      radius: '60%',
      center: ['40%', '50%'],
      label: {
        fontSize: 14,
        borderWidth: 20,
        color: fontColor,
        normal: {
          show: true,
          formatter: '{b} ({d}%)',
        },
      },
      // 延伸线
      labelLine: {
        length: 16,
        length2: 24,
      },
      emphasis: {
        itemStyle: {
          borderWidth: 20,
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
    },
  ];
};

/**
 * 获取饼图的数据
 */
const genData = async (): Promise<HESI_IGenData> => {
  await hesiSerivce.getPieChartData();
  const seriesData = hesiSerivce.pieChartData?.pieChartDataList ?? [];
  const legendData = seriesData.map((item) => item.name) ?? [];
  if (!hesiSerivce.noNode) {
    treeType.value = hesiSerivce.pieChartData?.treeType ?? '';
    treeId.value = hesiSerivce.pieChartData?.treeId ?? null;
  }
  return {
    legendData: legendData,
    seriesData: seriesData,
    pieChartName: hesiSerivce.pieChartData?.pieChartName ?? '',
    energyName: hesiSerivce.pieChartData?.energyName ?? '',
    unit: hesiSerivce.pieChartData?.unit ?? '',
  };
};

/**
 * size大小变化
 */
const resize = () => {
  if (myChart) {
    myChart.resize();
  }
};

const treeIds = ref<(null | number)[]>([]);

const backTo = () => {
  if (treeIds.value.length > 1) {
    hesiSerivce.queryParams.treeId = treeIds.value[treeIds.value.length - 2];
    treeIds.value.pop();
  }
  updateCharts();
};

/**
 * 更新chart
 */
const updateCharts = async (id?: number) => {
  const data = await genData();
  //没有数据时跳转之后也需要返回上一级
  if (data.seriesData.length !== 0 || hesiSerivce.noData.flag) {
    if (id) {
      !treeIds.value.includes(id) && treeIds.value.push(id);
    }
    const newOption = {
      title: genTitle(data),
      tooltip: genTooltip(data),
      legend: genLegend(),
      series: genSeries(data),
    };
    if (!myChart) {
      myChart = init(echartRef.value);
    }
    myChart.clear(); // 清空绘画内容，清空后实例可用
    myChart.setOption(newOption);
  }
  // 2024-0112-先取消监听
  myChart.off('click');
  if (myChart) {
    myChart.on('click', (params: any) => {
      hesiSerivce.queryParams.treeId = params.data.id;
      updateCharts(params.data.id);
    });
  }
};

/**
 * 组件挂载
 */
onMounted(async () => {
  await hesiSerivce.getEnergyTypeList();
  hesiSerivce.queryParams.componentId = props.uid;
  await initPieChart();
  treeIds.value.push(null);
  if (myChart) {
    myChart.on('click', (params: any) => {
      hesiSerivce.queryParams.treeId = params.data.id;
      updateCharts(params.data.id);
    });
  }
  // hesiSerivce.noConfig = true;
  window.addEventListener('resize', resize);
});

// 组件卸载
onUnmounted(() => {
  myChart.off('click');
  window.removeEventListener('resize', resize);
});

const selectEnergyCode = (code: string) => {
  hesiSerivce.queryParams.energyCode = code;
  hesiSerivce.queryParams.treeId = null;
  treeIds.value = [null];
  updateCharts();
};
</script>

<style lang="less" scoped>
.home-energy-sub-item {
  height: 380px;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
  position: relative;
  background-color: #fff;
  .hesi-back {
    position: absolute;
    top: 16px;
    left: 30px;
    z-index: 99999;
  }
  .hesi-switch {
    background-color: #f5f5f5;
    color: rgba(0, 0, 0, 0.65);
    height: 32px;
    position: absolute;
    top: 16px;
    right: 32px;
    padding: 0 2px;
    display: flex;
    align-items: center;
    border-radius: 16px;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
    z-index: 99999;
    span {
      height: 30px;
      line-height: 30px;
      padding: 0 16px;
      cursor: pointer;
      border-radius: 16px;
      transition: all 0.4s cubic-bezier(0.88, 0.03, 0, 0.91), box-shadow 0.4s ease;
    }
    span.selected {
      color: #1890ff;
      background-color: #fff;
    }
  }
  .hesi-echart {
    height: 100%;
  }
}
</style>
