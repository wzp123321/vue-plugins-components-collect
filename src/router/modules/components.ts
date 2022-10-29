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
]

export default components
