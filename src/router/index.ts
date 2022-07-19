import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import pluginRoutes from './modules/plugins'
import animationRoutes from './modules/animation'

const routes: RouteRecordRaw[] = [
  {
    path: '/echarts-map',
    meta: {
      name: '地球',
    },
    component: () => import('../pages/echarts/chart-map/chart-map.vue'),
  },
  {
    path: '/echarts-line-mark',
    meta: {
      name: '折线图',
    },
    component: () => import('../pages/echarts/alarm-chart/alarm-chart.vue'),
  },
  {
    path: '/echarts-water-ball',
    meta: {
      name: '水球',
    },
    component: () =>
      import('../pages/echarts/water-ball-chart/water-ball-chart.vue'),
  },
  {
    path: '/plugins-video-broadcast',
    meta: {
      name: '语音播报',
    },
    component: () =>
      import('../pages/plugins/video-broadcast/video-broacast.vue'),
  },
  ...pluginRoutes,
  ...animationRoutes,
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
