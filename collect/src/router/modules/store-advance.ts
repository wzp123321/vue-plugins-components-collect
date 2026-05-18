import { RouteRecordRaw } from 'vue-router';

const storeRoutes: RouteRecordRaw[] = [
  {
    path: '/store-persist',
    meta: {
      name: 'Pinia持久化',
    },
    component: () => import('../../pages/store-advance/pinia-persist/pinia-persist.vue'),
  },
  {
    path: '/store-setup',
    meta: {
      name: 'Setup Store',
    },
    component: () => import('../../pages/store-advance/setup-store/setup-store.vue'),
  },
];

export default storeRoutes;
