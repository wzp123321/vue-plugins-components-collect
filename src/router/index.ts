import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import pluginRoutes from './modules/plugins'
import componentRoutes from './modules/components'
import echartRoutes from './modules/echarts'
import animationRoutes from './modules/animation'

const routes: RouteRecordRaw[] = [
  {
    path: '/demo',
    component: () => import('../demo/demo.vue'),
  },
  {
    path: '/grid',
    component: () => import('../pages/grid/grid.vue'),
  },
  ...componentRoutes,
  ...pluginRoutes,
  ...animationRoutes,
  ...echartRoutes,
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  document.title = (to.meta?.name as string) ?? '收集系统'

  next()
})

export default router
