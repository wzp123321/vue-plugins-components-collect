<template>
  <div class="pie-long-label">
    <div ref="chartRef"></div>
  </div>
</template>

<script lang="ts" setup>
import { useEChartsInit } from '@/hooks';
import { EChartsOption, EChartsType } from 'echarts';
import { onMounted } from 'vue';

defineOptions({
  name: 'PieLongLabel',
});
const { chartRef, initCharts } = useEChartsInit();
const ROOT_PATH = 'https://echarts.apache.org/examples';
const weatherIcons = {
  Sunny: `${ROOT_PATH}/data/asset/img/weather/sunny_128.png`,
  Cloudy: `${ROOT_PATH}/data/asset/img/weather/cloudy_128.png`,
  Showers: `${ROOT_PATH}/data/asset/img/weather/showers_128.png`,
};

/**
 *
 */
const mapChartOptions = (): EChartsOption => ({
  title: {
    text: 'Weather Statistics',
    subtext: 'Fake Data',
    left: 'center',
  },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b} : {c} ({d}%)',
    appendToBody: true,
    className: 'custom-tooltip',
  },
  legend: {
    bottom: 10,
    left: 'center',
    data: ['CityA', 'CityB', 'CityD', 'CityCCityCCityCCityCCityCCityCCityCCityCCityCCityCCityCCityC', 'CityE'],
  },
  series: [
    {
      type: 'pie',
      radius: '65%',
      center: ['50%', '50%'],
      selectedMode: 'single',
      data: [
        {
          value: 1548,
          name: 'CityE',
          label: {
            formatter: [
              '{title|{b}}{abg|}',
              '  {weatherHead|Weather}{valueHead|Days}{rateHead|Percent}',
              '{hr|}',
              '  {Sunny|}{value|202}{rate|55.3%}',
              '  {Cloudy|}{value|142}{rate|38.9%}',
              '  {Showers|}{value|21}{rate|5.8%}',
            ].join('\n'),
            backgroundColor: '#eee',
            borderColor: '#777',
            borderWidth: 1,
            borderRadius: 4,
            rich: {
              title: {
                color: '#eee',
                align: 'center',
              },
              abg: {
                backgroundColor: '#333',
                width: '100%',
                align: 'right',
                height: 25,
                borderRadius: [4, 4, 0, 0],
              },
              Sunny: {
                height: 30,
                align: 'left',
                backgroundColor: {
                  image: weatherIcons.Sunny,
                },
              },
              Cloudy: {
                height: 30,
                align: 'left',
                backgroundColor: {
                  image: weatherIcons.Cloudy,
                },
              },
              Showers: {
                height: 30,
                align: 'left',
                backgroundColor: {
                  image: weatherIcons.Showers,
                },
              },
              weatherHead: {
                color: '#333',
                height: 24,
                align: 'left',
              },
              hr: {
                borderColor: '#777',
                width: '100%',
                borderWidth: 0.5,
                height: 0,
              },
              value: {
                width: 20,
                padding: [0, 20, 0, 30],
                align: 'left',
              },
              valueHead: {
                color: '#333',
                width: 20,
                padding: [0, 20, 0, 30],
                align: 'center',
              },
              rate: {
                width: 40,
                align: 'right',
                padding: [0, 10, 0, 0],
              },
              rateHead: {
                color: '#333',
                width: 40,
                align: 'center',
                padding: [0, 10, 0, 0],
              },
            },
          },
        },
        {
          value: 735,
          name: 'CityCCityCCityCCityCCityCCityCCityCCityCCityCCityCCityCCityC',
          label: {
            show: true,
            width: 200,
          },
        },
        { value: 510, name: 'CityD' },
        { value: 434, name: 'CityB' },
        { value: 335, name: 'CityA' },
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
    },
  ],
});
let chartInstance: EChartsType | undefined;
onMounted(() => {
  if (chartRef.value) {
    chartInstance = initCharts(mapChartOptions());
    if (chartInstance) {
      chartInstance.off('globalout');
      chartInstance.on('globalout', () => {
        setTimeout(() => {
          chartInstance?.dispatchAction({
            type: 'hideTip',
          });
        }, 250);
      });
    }
  }
});
</script>

<style lang="less" scoped>
.pie-long-label {
  width: 100%;
  height: 100%;

  > div:first-child,
  canvas {
    width: 100%;
    height: 100%;
  }
}
</style>
<style lang="less">
.custom-tooltip {
  max-width: 200px;
  white-space: normal !important;
  word-break: break-all;
}
</style>
