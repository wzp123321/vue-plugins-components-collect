import { FSetCookie, FSetSession } from '@/core/token';
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { getServerTime } from '@/core/service';

const routes: RouteRecordRaw[] = [
  {
    path: '/cloud',
    name: 'CloudHome',
    meta: { title: '天溯运营中心' },
    component: () => import('../pages/cloud-home/cloud-home.vue'),
  },
  {
    path: '/terminal',
    name: 'TerminalHome',
    meta: { title: '天溯运营中心' },
    component: () => import('../pages/terminal-home/terminal-home.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});
export default router;

const querySystemTime = async () => {
  try {
    sessionStorage.setItem('dTimeValue', '');
    const serverTime: any = await getServerTime();
    if (serverTime.code === 200 && serverTime.data) {
      const dTimeValue = String(new Date(serverTime.data).getTime() - new Date().getTime());
      sessionStorage.setItem('dTimeValue', dTimeValue);
    } else {
      sessionStorage.setItem('dTimeValue', '');
    }
  } catch (error) {
    sessionStorage.setItem('dTimeValue', '');
  }
};

router.beforeEach(async (to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title as string;
  }

  await querySystemTime();

  next();
});
