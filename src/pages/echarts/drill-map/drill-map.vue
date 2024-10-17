<template>
  <div class="drill-map">
    <!-- 返回按钮 -->
    <button class="dm-back" @click="back" v-if="drillCodes.length > 0">返回上一级</button>
    <div class="dm-map" ref="chartRef"></div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { EChartsType, registerMap, EChartsOption } from 'echarts';
import { useECharts } from '@/hooks';
import { message } from 'ant-design-vue';

defineOptions({
  name: 'DrillMap',
});

const { chartRef, initCharts, addResize, removeResize } = useECharts();

// 当前层级code，默认
const currentMapCode = ref('100000_full');
/**
 * 根据code获取具体json数据
 */
const getMapJson = async (code: string) => {
  const url = `https://geo.datav.aliyun.com/areas_v3/bound/${code}.json`;
  const mapJson = await fetch(url).then((res) => res.json());
  return mapJson;
};
/**
 * 回去配置
 */
const getMapChartOptions = (mapName: string, mapData: any): EChartsOption => {
  return {
    // 鼠标悬浮提示
    tooltip: {
      show: true,
      borderColor: 'rgba(0, 0, 0, 0.15)',
      formatter: (params: any) => {
        // 根据需要进行数据处理或格式化操作
        if (params && params.data) {
          const { addressCode, name, data } = params.data;
          // 返回自定义的tooltip内容
          return `addressCode: 【${addressCode}】<br>name: ${name}<br>data: ${data}`;
        }
      },
    },
    // 左下角的数据颜色条
    visualMap: {
      show: true,
      min: 0,
      max: 10,
      left: 'left',
      top: 'bottom',
      text: ['高', '低'], // 文本，默认为数值文本
      calculable: true,
      seriesIndex: [0],
      inRange: {
        color: ['#ff1c1c', '#9ef8ff'], // 蓝绿
      },
    },
    // geo地图
    geo: {
      map: mapName,
      roam: true,
      select: {
        disabled: true,
      },
      aspectScale: 1.2, // 缩放
      // 图形上的文本标签，可用于说明图形的一些数据信息，比如值，名称等。
      selectedMode: 'single',
      // 地图上的文本
      label: {
        show: false,
      },
      emphasis: {
        itemStyle: {
          areaColor: '#389BB7',
          borderColor: '#389BB7',
          borderWidth: 0,
        },
        label: {
          fontSize: 14,
        },
      },
    },
    series: [
      // 地图数据
      {
        type: 'map',
        map: mapName,
        roam: true,
        geoIndex: 0,
        select: false,
        data: mapData,
      },
      // 散点
      {
        name: '散点',
        type: 'scatter',
        coordinateSystem: 'geo',
        data: mapData,
        itemStyle: {
          color: '#05C3F9',
        },
      },
      // 气泡点
      {
        name: '点',
        type: 'scatter',
        coordinateSystem: 'geo',
        symbol: 'pin', //气泡
        symbolSize: function (val: any) {
          if (val) {
            return val[2] / 4 + 16;
          }
        },
        label: {
          show: true,
          formatter: function (params: any) {
            return params.data.data || 0;
          },
          color: '#fff',
          fontSize: 9,
        },
        itemStyle: {
          color: '#F62157', //标志颜色
        },
        zlevel: 6,
        data: mapData,
      },
      // 地图标点
      {
        name: 'Top 5',
        type: 'effectScatter',
        coordinateSystem: 'geo',
        data: mapData.map((item: { data: number }) => {
          if (item.data > 6) return item;
        }),
        symbolSize: 15,
        showEffectOn: 'render',
        rippleEffect: {
          brushType: 'stroke',
        },
        label: {
          formatter: '{b}',
          position: 'right',
          show: true,
        },
        itemStyle: {
          color: 'yellow',
          shadowBlur: 10,
          shadowColor: 'yellow',
        },
        zlevel: 1,
      },
    ],
  };
};

// 历史下钻节点
const drillCodes = ref<string[]>([]);
let chartInstance: EChartsType;
/**
 * 初始化
 */
const initMap = async () => {
  // 拿地图json数据
  const jsonData = await getMapJson(currentMapCode.value);
  // 注册地图
  registerMap(currentMapCode.value, jsonData);
  const mapData = jsonData.features.map((item: { properties: any }) => {
    const data = (Math.random() * 8 + 2).toFixed(0); // 随机数
    const tempValue = item.properties.center ? [...item.properties.center, data] : item.properties.center;
    return {
      name: item.properties.name,
      value: tempValue, // 中心点经纬度
      addressCode: item.properties.adcode, // 区域编码
      level: item.properties.level, // 层级
      data, // 模拟数据
    };
  });

  if (chartInstance) {
    chartInstance.dispose();
  }
  chartInstance = initCharts(getMapChartOptions(currentMapCode.value, mapData));
  const handleClick = (param: any) => {
    // 只有点击地图才触发
    if (param.seriesType === 'map') {
      const { addressCode, level } = param.data;
      console.log('adcode', addressCode, param);
      const mapName = level === 'district' ? addressCode : addressCode + '_full';
      // 防止最后一个层级被重复点击，返回上一级出错
      if (drillCodes.value[drillCodes.value.length - 1] === mapName) {
        message.warning('已经是最下层了');
        return;
      }
      // 每次下转都记录下地图的name，在返回的时候使用
      drillCodes.value.push(mapName);
      console.log(drillCodes.value, mapName);
      currentMapCode.value = mapName;
      initMap();
    }
  };
  chartInstance.off('click', handleClick);
  chartInstance.on('click', handleClick);
};

const back = () => {
  drillCodes.value.pop();
  currentMapCode.value = drillCodes.value.length === 0 ? '100000_full' : drillCodes.value[drillCodes.value.length - 1];
  initMap();
};

onMounted(() => {
  initMap();
  addResize();
});
onUnmounted(() => {
  removeResize();
});
</script>
<style lang="less" scoped>
.drill-map {
  width: 100%;
  height: 100%;
  position: relative;

  > .dm-back {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 99;
  }

  > .dm-map {
    width: 100%;
    height: 100%;
  }
}
</style>
