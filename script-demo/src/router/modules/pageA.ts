import Layout from '@/components/layout/index.vue';

export default [
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: 'pageA',
        name: 'PageA',
        meta: {
          title: '页面示例',
          requiresAuth: true,
        },
        redirect: {
          name: 'ExampleList',
        },
        children: [
          {
            path: 'list',
            name: 'ExampleList',
            component: () => import('@/views/pageA/index.vue'),
            meta: {
              title: '示例列表',
              perssionCodes: ['a'],
              key: 'PageA',
            },
          },
          {
            path: 'create',
            name: 'ExampleCreate',
            component: () => import('@/views/pageA/modules/createForm.vue'),
            meta: {
              title: '示例新增',
              requiresAuth: true,
              noTag: true,
              key: 'PageA',
            },
          },
          {
            path: 'edit',
            name: 'ExampleEdit',
            component: () => import('@/views/pageA/modules/createForm.vue'),
            meta: {
              title: '示例编辑',
              requiresAuth: true,
              noTag: true,
              key: 'PageA',
            },
          },
          {
            path: 'detail',
            name: 'ExampleDetail',
            component: () => import('@/views/pageA/modules/detail.vue'),
            meta: {
              title: '示例详情',
              requiresAuth: true,
              key: 'PageA',
              noTag: true,
            },
          },
        ],
      },
    ],
  },
];
