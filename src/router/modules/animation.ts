import { RouteRecordRaw } from 'vue-router'

const pluginRoutes: RouteRecordRaw[] = [
  {
    path: '/animation/countDown',
    meta: {
      name: '倒计时',
    },
    component: () => import('../../pages/animations/count-down/count-down.vue'),
  },
]

export default pluginRoutes
