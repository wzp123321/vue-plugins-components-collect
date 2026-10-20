import type { RouteRecordRaw } from "vue-router";
import { createRouter, createWebHistory } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/tag1",
    name: "Tag1",
    component: {
      template: "<div>页签1</div>",
    },
    meta: {
      hidden: false,
      title: "页签1",
    },
  },
  {
    path: "/tag2",
    name: "Tag2",
    component: {
      template: "<div>页签2</div>",
    },
    meta: {
      hidden: false,
      title: "页签2",
    },
  },
];

const router = createRouter({
  history: createWebHistory("/ts-package-document/zh-CN/component"),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});
export default router;
