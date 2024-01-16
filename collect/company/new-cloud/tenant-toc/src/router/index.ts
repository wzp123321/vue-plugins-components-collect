import { FSetCookie } from '@/core/token';
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import commonService from '@/service/pkg/index';
import { ElMessage } from 'element-plus';

import containerRoutes from './containerRoutes';
import { FORBIDDEN_CODES } from '@/config/index';
import { CommonEPageType } from '@/service/api';
import { FGetQueryParam, getTenant, isMac } from '@/utils';
import { EHostMenuFlag } from '@/config/enum';
import cryptoUtil from '@/utils/crypto';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import(/* webpackChunkName: "tenant-home" */ '@/views/home/home.vue'),
    children: [
      // 能源事件库
      {
        path: '/home/energyEventLibrary',
        name: 'EnergyEventLibrary',
        meta: { name: '能源事件库' },
        component: () =>
          import(
            /* webpackChunkName: "tenant-energy-event-library" */ '@/pages/energy-event-library/energy-event-library.vue'
          ),
      },
      // 项目管理
      {
        path: '/home/projectManage',
        name: 'ProjectManage',
        meta: { name: '项目管理' },
        redirect: '/home/projectManage/list',
        component: () =>
          import(/* webpackChunkName: "tenant-project-manage" */ '@/pages/project-manage/project-manage.vue'),
        children: [
          {
            path: '/home/projectManage/list',
            name: 'ProjectList',
            meta: { name: '项目列表' },
            component: () =>
              import(/* webpackChunkName: "tenant-project-list" */ '@/pages/project-manage/pm-list/pm-list.vue'),
            children: [],
          },
          {
            path: '/home/projectManage/editor',
            name: 'ProjectEditor',
            meta: { name: '项目编辑' },
            component: () =>
              import(
                /* webpackChunkName: "tenant-project-editor" */ '@/pages/project-manage/pm-add-editor/pm-add-editor.vue'
              ),
            children: [],
          },
          {
            path: '/home/projectManage/view',
            name: 'ProjectView',
            meta: { name: '项目查看' },
            component: () =>
              import(/* webpackChunkName: "tenant-project-view" */ '@/pages/project-manage/pm-view/pm-view.vue'),
            children: [],
          },
        ],
      },
      // 综能项目库
      {
        path: '/home/energyProjectLibrary',
        name: 'EnergyProjectLibrary',
        redirect: '/home/energyProjectLibrary/list',
        meta: { name: '综能项目库' },
        component: () =>
          import(
            /* webpackChunkName: "tenant-energyProjectLibrary" */ '@/pages/energy-project-library/energy-project-library.vue'
          ),
        children: [
          {
            path: '/home/energyProjectLibrary/list',
            name: 'EnergyProjectLibraryList',
            meta: { name: '综能项目库' },
            component: () =>
              import(
                /* webpackChunkName: "tenant-energyProjectLibrary-list" */ '@/pages/energy-project-library/ep-library-list/ep-library-list.vue'
              ),
            children: [],
          },
          {
            path: '/home/energyProjectLibrary/editor',
            name: 'EnergyProjectLibraryEditor',
            meta: { name: '综能项目库' },
            component: () =>
              import(
                /* webpackChunkName: "tenant-energyProjectLibrary-editor" */ '@/pages/energy-project-library/ep-library-editor/ep-library-editor.vue'
              ),
            children: [],
          },
        ],
      },
      {
        path: '/home/costDetail',
        name: 'homeCostDetail',
        meta: { name: '成本明细' },
        component: () => import(/* webpackChunkName: "tenant-cost-detail" */ '@/pages/cost-detail/cost-detail.vue'),
      },
      {
        path: '/home/logManagement',
        name: 'logManagement',
        meta: { name: '日志管理' },
        component: () =>
          import(/* webpackChunkName: "tenant-logManagement" */ '@/pages/log-management/log-management.vue'),
      },
      {
        path: '/home/projectInfoConfig',
        name: 'ProjectInfoConfig',
        meta: { name: '项目信息配置' },
        component: () =>
          import(
            /* webpackChunkName: "tenant-ma-projectInfoConfig" */ '@/pages/project-information-configuration/project-information-configuration.vue'
          ),
      },
      {
        path: '/home/benchmarkingLibrary',
        name: 'BenchmarkingLibrary',
        meta: { name: '能耗对标库' },
        component: () =>
          import(
            /* webpackChunkName: "tenant-benchmarkingLibrary" */ '@/pages/knowledge-base/kb-benchmaerking-library/kb-benchmaerking-library.vue'
          ),
      },
      {
        path: '/home/benchmarkingDataMaintenance',
        name: 'BenchmarkingDataMaintenance',
        meta: { name: '对标数据维护' },
        component: () =>
          import(
            /* webpackChunkName: "tenant-benchmarkingDataMaintenance" */ '@/pages/knowledge-base/kb-benchmarking-data-maintenance/kb-benchmarking-data-maintenance.vue'
          ),
      },
      {
        path: '/home/measureLibrary',
        name: 'MeasureLibrary',
        meta: { name: '节能措施库' },
        component: () =>
          import(
            /* webpackChunkName: "tenant-measureLibrary" */ '@/pages/knowledge-base/kb-measure-library/kb-measure-library.vue'
          ),
      },
    ],
  },
  ...containerRoutes,
  {
    path: '/:pathMatch(.*)',
    redirect: '/404',
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import(/* webpackChunkName: "tenant-not-found" */ '@/views/not-found/not-found.vue'),
  },
  {
    path: '/403',
    name: 'NotPermission',
    component: () =>
      import(/* webpackChunkName: "tenant-not-permission" */ '@/views/not-permission/not-permission.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title as string;
  }
  if (process.env.NODE_ENV === 'development') {
    FSetCookie('toc_tenant_id', '18');
    FSetCookie('toc-token', '64bd65520a1048d282431a5dd1062319e46646272beff82dac0492342f0edf411703159078649');
    FSetCookie('username', 'wanzp');
  }

  if (to.path !== '/404' && to.path !== '/403' && to.path !== '/login') {
    const serverTime = await commonService.getServerTime();
    if (serverTime.code === 200 && serverTime.data) {
      const dTimeValue = String(
        new Date(isMac() ? serverTime.data?.replaceAll('-', '/') : serverTime.data).getTime() - new Date().getTime(),
      );
      sessionStorage.setItem('dTimeValue', dTimeValue);
    } else {
      sessionStorage.setItem('dTimeValue', '');
    }
  }
  next();
});

router.afterEach(async (to: any) => {
  try {
    if (to.path !== '/404' && to.path !== '/403' && to.path !== '/login' && window.IS_PRODUCTION) {
      if (
        !to.path.includes('/home') ||
        to.path === '/home/projectManage/editor' ||
        to.path === '/home/projectManage/view'
      ) {
        if (
          !cryptoUtil.Decrypt(FGetQueryParam('tenantCode') ?? '') ||
          !cryptoUtil.Decrypt(FGetQueryParam('tenantId') ?? '')
        ) {
          router.replace('/403');
          return;
        }
      }
      const res = await commonService.checkHostingMenu({
        ...getTenant(),
        systemFlag:
          to.matched.length !== 0 && to.matched[0].path === '/home'
            ? CommonEPageType.TOC页面
            : CommonEPageType.项目级页面,
        url: getAllDynamicRouteList(to),
        historyFlag: EHostMenuFlag.需要,
        isDefaultUrl: to.query.time && new Date().getTime() - to.query.time < 2000 ? '1' : '0',
      });
      if (res && res.code === 200 && res.data) {
        if (!res.data.checkResult) {
          if (res.data.defaultUrl !== '/404' && res.data.defaultUrl !== '/403') {
            ElMessage.error('当前用户无此权限！');
          }
          if (res.data.defaultUrl === '/404' || res.data.defaultUrl === '/403') {
            router.replace({ path: res.data?.defaultUrl });
          } else {
            router.push({ path: res.data?.defaultUrl });
          }
        }
      } else {
        if (!FORBIDDEN_CODES?.includes(res?.code)) {
          router.replace('/403');
        }
      }
    }
  } catch (error: any) {
    if (!FORBIDDEN_CODES?.includes(error?.status)) {
      router.replace('/403');
    }
  }
});

//获取动态默认路由
function getAllDynamicRouteList(val: any) {
  let routeName = '';
  if (val.matched.length !== 0) {
    const dynamicRouteList = val.matched[val.matched.length - 1].path.split('/');
    dynamicRouteList.forEach((item: any) => {
      if (item.substring(0, 1) !== ':' && item !== '') {
        routeName = routeName + '/' + item;
      }
    });
  }
  if (routeName === '') {
    routeName = val.path;
  }
  return routeName;
}

export default router;
