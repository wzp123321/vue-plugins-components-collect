import { RouteRecordRaw } from 'vue-router'

const components: RouteRecordRaw[] = [
  {
    path: '/component-inputFilter',
    meta: {
      name: '输入框过滤',
    },
    component: () =>
      import('../../pages/components/input-filter/input-filter.vue'),
  },
  {
    path: '/component-vue3-virtual-list',
    meta: {
      name: '虚拟表格',
    },
    component: () =>
      import(
        '../../pages/components/vue3-virtual-list-container/vue3-virtual-list-container.vue'
      ),
  },
  {
    path: '/virtual-card-load',
    meta: {
      name: '虚拟卡片加载',
    },
    component: () =>
      import('../../pages/components/virtual-card-load/virtual-card-load.vue'),
  },
  {
    path: '/component-spreaJs-designer',
    meta: {
      name: 'Designer',
    },
    component: () => import('../../pages/spreadJs-designer/Designer.vue'),
  },
  {
    path: '/component-spreaJs-sheet',
    meta: {
      name: 'DesignerSheet',
    },
    component: () => import('../../pages/spreadJs-designer/SpreadSheet.vue'),
  },
]

export default components
