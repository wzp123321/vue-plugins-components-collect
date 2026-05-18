import { RouteRecordRaw } from 'vue-router';

const networkRoutes: RouteRecordRaw[] = [
  {
    path: '/network-axios',
    meta: {
      name: 'Axios请求封装',
    },
    component: () => import('../../pages/network/axios-demo/axios-demo.vue'),
  },
  {
    path: '/network-websocket',
    meta: {
      name: 'WebSocket通信',
    },
    component: () => import('../../pages/network/websocket/websocket.vue'),
  },
  {
    path: '/network-sse',
    meta: {
      name: 'SSE流式数据',
    },
    component: () => import('../../pages/network/sse/sse.vue'),
  },
  {
    path: '/network-webrtc',
    meta: {
      name: 'WebRTC 通信',
    },
    component: () => import('../../pages/plugins/plugins-webrtc/plugins-webrtc.vue'),
  },
];

export default networkRoutes;
