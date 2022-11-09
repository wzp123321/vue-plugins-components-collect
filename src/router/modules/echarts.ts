import { RouteRecordRaw } from 'vue-router'

const components: RouteRecordRaw[] = [
  {
    path: '/echarts-map',
    meta: {
      name: '地球',
    },
    component: () => import('../../pages/echarts/chart-map/chart-map.vue'),
  },
  {
    path: '/echarts-province',
    meta: {
      name: '省份',
    },
    component: () =>
      import('../../pages/echarts/chart-province/chart-province.vue'),
  },
  {
    path: '/echarts-line-mark',
    meta: {
      name: '折线图',
    },
    component: () => import('../../pages/echarts/alarm-chart/alarm-chart.vue'),
  },
  {
    path: '/echarts-water-ball',
    meta: {
      name: '水球',
    },
    component: () =>
      import('../../pages/echarts/water-ball-chart/water-ball-chart.vue'),
  },
  {
    path: '/echarts-breakpoint-linechart',
    meta: {
      name: '断点折线图',
    },
    component: () =>
      import(
        '../../pages/echarts/breakpoint-linechart/breakpoint-linechart.vue'
      ),
  },
  {
    path: '/echarts-rankr-BarCharts',
    meta: {
      name: '柱状图',
    },
    component: () =>
      import('../../pages/echarts/rank-barCharts/rank-barCharts.vue'),
  },
]

export default components
