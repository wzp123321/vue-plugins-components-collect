<template>
  <div class="echarts-graphic" id="echarts-graphic">
    <div :id="customChartId" class="eg-charts-container"></div>
  </div>
</template>
<script lang="ts" setup>
import { computed, onMounted } from 'vue';
import { EChartsOption, init } from 'echarts';

const imgUrl = new URL('../../../assets/images/echarts/v2-147b681f501c12a4ac4da7ed3c5e3b16_b.png', import.meta.url)
  .href;

const customChartId = computed(() => {
  return `charts_${(Math.random() * 100000000).toFixed(0)}`;
});

let chart;

onMounted(() => {
  initChart();
});

const initChart = () => {
  const echartEle = document.getElementById(customChartId.value);
  if (!echartEle) {
    return;
  }
  chart = init(echartEle);
  const options = getOptions();
  chart.setOption(options);
};

const getOptions = (): EChartsOption => {
  return {
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    yAxis: {
      type: 'value',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    graphic: [
      {
        id: 'logo',
        type: 'image',
        bottom: 0,
        right: 0,
        bounding: 'raw',
        style: {
          image: imgUrl,
          x: 0,
          y: 0,
          width: 66,
          height: 66,
          opacity: 1,
          lineHeight: 40,
          fill: 'rgba(0,0,0,0.3)',
          stroke: 'rgba(0,0,0,0.3)',
        },
        onclick: handleImageClick,
      },
      {
        id: 'test',
        type: 'text',
        top: 0,
        right: 0,
        rotation: -Math.PI / 4,
        zlevel: 9,
        style: {
          text: '测试Graphic,作者：wanzp',
          fontSize: '24',
          align: 'center',
        },
      },
      {
        id: 'test-group',
        type: 'group',
        left: 0,
        bottom: 0,
        z: 100,
        rotation: -Math.PI / 4,
        children: [
          {
            id: 'groud-rect',
            type: 'rect',
            left: 'center',
            top: 'center',
            z: 100,
            shape: {
              width: 400,
              height: 50,
            },
            style: {
              fill: 'rgba(0,0,0,0.3)',
              opacity: 0.8,
            },
          },
          {
            id: 'groud-text',
            type: 'text',
            left: 'center',
            top: 'center',
            z: 100,
            style: {
              fill: '#fff',
              text: 'ECHARTS LINE CHART',
              font: 'bold 26px sans-serif',
              opacity: 0.8,
            },
          },
        ],
        onclick: handleGroupClick,
      },
      {
        type: 'circle',
        id: 'test-circle',
        top: 0,
        left: 0,
        rotation: -Math.PI / 4,
        zlevel: 9,
        shape: {
          cx: 10,
          cy: 3,
          r: 33,
        },
        style: {
          stroke: 'red',
          fill: 'red',
          lineHeight: 2,
        },
      },
    ],
    series: [
      {
        data: [150, 230, 224, 218, 135, 147, 260],
        type: 'line',
      },
    ],
  };
};

const handleImageClick = (e: any) => {
  console.log(e);
};

const handleGroupClick = (e: any) => {
  console.log(e);
};
</script>
<style lang="less" scoped>
#echarts-graphic {
  width: 100%;
  height: 100%;

  .eg-charts-container {
    width: 100%;
    height: 400px;

    * {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
