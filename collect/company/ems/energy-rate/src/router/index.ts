import { createRouter, createWebHistory } from 'vue-router';
import { routes } from './routes';
import { FSetStorageData } from '../utils/token';

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  document.title = (to?.meta?.title as string) ?? '能源管理';

  window.IS_PRODUCTION = import.meta.env?.VITE_NODE_ENV !== 'development';

  if (!window.IS_PRODUCTION) {
    FSetStorageData('energy-token', 'd7c3e45a3879459dbd2bb2ec739f99d7142e62a833f67eea4a1066e0f3eda2091704697114892');
    FSetStorageData('energy-loginName', 'admin');
    FSetStorageData('ems-wholeHospitalFlag', 'true');
    FSetStorageData('energy-corpid', '888');
  }

  next();
});

export default router;
