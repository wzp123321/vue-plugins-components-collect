# _archive — 已归档的孤儿页面

本目录存放**曾存在但从未接入导航/路由**的演示页面，2026-10-20 从 `src/pages/` 整体移入，仅供回溯参考，不参与构建（Vite 只打包被路由引用到的文件）。

| 原路径 | 归档原因 |
|---|---|
| `pages/canvas-advance/echarts-gantt/` | 从未注册路由；同能力图表已由 `pages/echarts/components/*` 覆盖 |
| `pages/canvas-advance/echarts-heatmap/` | 同上 |
| `pages/canvas-advance/echarts-scatter/` | 同上 |
| `pages/components/g6-chart/` | 空壳页面（无脚本逻辑）；真正的 G6 演示在 `pages/plugins/plugins-antv-g6/`（路由 `/data-vis-g6`） |
| `pages/plugins/vue-monoplasty-slide-verify/` | 旧版滑动验证；新版在 `pages/plugins/vue3-slide-verify/`（路由 `/vue3SlideVerify`） |

如需恢复某个页面：把目录移回 `src/pages/` 原位置，并在 `src/router/modules/*.ts` 注册路由、在 `src/views/layout/aside-box/constant.ts` 补导航条目（两处都要改，可用 `npm run check:nav` 校验一致性）。
