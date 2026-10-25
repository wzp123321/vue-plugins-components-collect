import { RouteRecordRaw } from 'vue-router';

/**
 * 2026-10 缺口盘点后新增的能力页（见 src/config/capability-profiles.ts 的画像）
 * 微前端经评估暂不收录。
 */
const extendedRoutes: RouteRecordRaw[] = [
  {
    path: '/permission',
    meta: { name: '权限方案' },
    component: () => import('../../pages/permission/permission.vue'),
  },
  {
    path: '/workflow-designer',
    meta: { name: '审批流设计器' },
    component: () => import('../../pages/workflow-designer/workflow-designer.vue'),
  },
  {
    path: '/gantt-schedule',
    meta: { name: '甘特图排期' },
    component: () => import('../../pages/gantt/gantt-schedule.vue'),
  },
  {
    path: '/ai-chat',
    meta: { name: 'AI 对话界面' },
    component: () => import('../../pages/ai-chat/ai-chat.vue'),
  },
  {
    path: '/speech-recognition',
    meta: { name: '语音识别与录音' },
    component: () => import('../../pages/speech-recognition/speech-recognition.vue'),
  },
  {
    path: '/screenshot-capture',
    meta: { name: '页面截图' },
    component: () => import('../../pages/screenshot/screenshot-capture.vue'),
  },
  {
    path: '/pdf-export',
    meta: { name: 'PDF 生成' },
    component: () => import('../../pages/pdf-export/pdf-export.vue'),
  },
  {
    path: '/code-editor',
    meta: { name: '代码编辑器' },
    component: () => import('../../pages/code-editor/code-editor.vue'),
  },
  {
    path: '/api-mock',
    meta: { name: '接口 Mock' },
    component: () => import('../../pages/api-mock/api-mock.vue'),
  },
  {
    path: '/unit-test',
    meta: { name: '单元测试示例' },
    component: () => import('../../pages/unit-test/unit-test.vue'),
  },
  {
    path: '/gsap-animation',
    meta: { name: 'GSAP 动画' },
    component: () => import('../../pages/gsap/gsap-animation.vue'),
  },
  {
    path: '/mind-map',
    meta: { name: '思维导图' },
    component: () => import('../../pages/mind-map/mind-map.vue'),
  },
  {
    path: '/i18n-demo',
    meta: { name: '国际化' },
    component: () => import('../../pages/i18n-demo/i18n-demo.vue'),
  },
  {
    path: '/teacher-manage',
    meta: { name: '教师信息 CRUD' },
    component: () => import('../../pages/teacher/teacher-manage/teacher-manage.vue'),
  },
];

export default extendedRoutes;
