// 错误页面路由信息
const globalRoutes = [
  {
    path: '/404',
    name: '404',
    component: () => import('@/components/error/404.vue'),
    meta: {
      title: '404页面',
      noTag: true,
    },
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/components/error/404.vue'),
    meta: {
      title: '404页面',
      noTag: true,
    },
  },
  {
    path: '/500',
    name: '500',
    component: () => import('@/components/error/404.vue'),
    meta: {
      title: '500页面',
      noTag: true,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    redirect: {
      name: '404',
    },
  },
];

export default globalRoutes;
