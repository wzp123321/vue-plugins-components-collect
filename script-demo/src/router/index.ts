import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import NProgress from './config/nprogress';
import { getEnvValue } from '@/utils/common';
import useTag from '@/store/tag';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { flatten, isEmpty } from 'lodash-es';
import Access from '@/utils/safe/initAccess';
import { TeMessageBox } from '@tiansu/element-plus';
import { useCommonStore } from '@/store/common';
import useAside from '@/components/layout/hooks/useAside';
import { MenuItem, TreeNode } from '@/apis/types';

interface GlobRouteType {
  [key: string]: RouteRecordRaw[];
}

const multiPattern: GlobRouteType = import.meta.glob(
  './modules/*.ts', // 匹配所有子目录的 Vue 文件
  {
    eager: true,
    import: 'default',
  },
);
/**
 * 路由采用history模式
 * routes:路由表
 * scrollBehavior: 控制页面的滚动行为
 */
/**
 *
 * 递归查找第一个有路径的菜单项
 * @param menuList 菜单列表
 * @returns 第一个有路径的菜单项
 */
function findFirstMenuWithPath(menuList: Array<TreeNode<MenuItem>>): any {
  let firstLeafMenu: MenuItem = menuList[0];
  function loop(menu: TreeNode<MenuItem>) {
    if (Array.isArray(menu.children) && menu.children[0]) {
      loop(menu.children[0]);
    } else {
      firstLeafMenu = menu;
    }
  }
  loop(firstLeafMenu);
  return firstLeafMenu;
}
const router = createRouter({
  history: createWebHistory(
    // eslint-disable-next-line no-underscore-dangle
    qiankunWindow.__POWERED_BY_QIANKUN__
      ? getEnvValue('VITE_APP_ROUTER_QIANKUN_BASE')
      : getEnvValue('VITE_APP_ROUTER_BASE'),
  ),

  routes: flatten(Object.values(multiPattern)),
  scrollBehavior: () => ({ left: 0, top: 0 }),
});
/**
 * @param to 目标路由
 * @param from 跳转触发的路由
 */
const whiteList = ['401', '404', '500'];
router.beforeEach(async (to, _from, next) => {
  await Access.init(); // 初始化网关相关接口
  const { getMenus } = useAside(router);
  if (whiteList.includes(to.name as string)) {
    next();
  }
  try {
    const commonStore = useCommonStore();
    if (isEmpty(commonStore.menuList)) {
      await getMenus();
    }
    if (isEmpty(commonStore.menuList)) {
      TeMessageBox.alert('抱歉，你没有养老管理系统的菜单权限', '提示', {
        cancelButtonText: '确定',
        callback: () => {
          if (window.parent !== window || window.frames.length > 0) {
            window.parent?.postMessage({ type: 'noAuthority' }, '*');
          } else {
            window.close();
          }
        },
      });
    } else if (to.path === '/') {
      const firstLeafMenu = findFirstMenuWithPath(commonStore.menuList);
      if (firstLeafMenu) {
        next({ path: firstLeafMenu.path, replace: true });
      } else {
        next({ name: '404', replace: true });
      }
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    next();
  }
  if (to.name && !to.meta.noTag) {
    const tagStore = useTag();
    const route = { ...to };
    route.matched = [];
    tagStore.addTag(route);
  }
  try {
    NProgress.start();
  } finally {
    NProgress.done();
  }
});

/**
 * @description 路由错误捕获
 * @error 错误内容
 */
router.onError((error) => {
  console.warn('路由错误', error.message);
});

export default router;
