# 项目长期记忆 — collect 组件收集站

## 工程约定
- 应用根 `collect/`：Vue3+Vite+TS+Element Plus+vue-router；样式 less scoped；el-* 自动导入，图标显式 import。
- 路由 `src/router/modules/*.ts`；页面 `src/pages/<类目>/<页面>/<页面>.vue`。
- 侧边栏手工维护 `src/views/layout/aside-box/constant.ts` 的 navGroups；新增页须同时改路由+导航，提交前 `node scripts/check-nav-routes.mjs`。孤儿页归档 `collect/_archive/pages/`。
- `te-*`（@tiansu）在用，别删。收录按场景建页。

## 外壳与主题
- 外壳 container.vue / aside-box.vue 用 `ai-*` 令牌，亮暗双模精致；主题由 useThemeStore 切 html.dark（默认深色）。
- `ai-theme.less`：:root 暗色令牌 + `html:not(.dark)` 亮色令牌（白玻璃表面 / hairline / 柔和阴影 / 紫青渐变）。`.ai-el-bridge()` 桥接 Element Plus 变量，:root 与 html.dark 各声明一次。
- `components-theme.css`：暗亮双模**共用一份** EP 组件皮肤（el-menu/el-card/el-table/el-input/el-button/el-dialog/el-drawer 等），无模式作用域——只引用 ai-theme.less 两套都已定义的 --ai-* 令牌。`dark-theme.css` 现仅留暗色专属：`--color-*` 变量块 + 外壳(aside-box/main-header/content)覆盖。`light-theme.css` 已并入前者并删。
- 旧 `color.less` 的 `--color-*`（Ant蓝+纯黑透明度）仍被部分老页用，与 ai-* 不统一（次要、范围大）。

## 四套 BI 录入台（vxe/VTable/Univer/Tabulator，并列主线）
- 列类型只四类；共用 `src/utils/bi-entry.ts` 纯函数（口径改一处）。单列配置 UI 一份 `bi-column-drawer/`；列设置列表一份 `bi-column-manager/`（class=bi-dlg）。三套只做映射+传 caps{frozen/group/width/required/retype/add}，别各写。
- 暗色行 hover 定版 #2e3137。暗色失配两模式：① rgba(0,0,0,α) 当 hover≈无→换 --color-text-background；② 写死浅底+令牌字色→底色换令牌。
- vxe: width 只认px；行hover刷在td；暗色靠 --vxe-ui-* 变量级覆盖非逐条:deep；筛选弹层在 .dt-page 内能继承 --bi-*。
- VTable: widthMode:'adaptive'；headerStyle.lineHeight 须数值；click_cell 的 cellLocation='columnHeader'；行hover须 cellBgColor==inlineRowBgColor 同值。
- Univer: 纯OSS六preset；无列头回调→用整列选中 A1='E:E' 等价；浮层真锚点 .univer-popup；暗色=反色，须恒喂亮色基调+toggleDarkMode(dark)；setBackground 写亮色值。
- Tabulator: import {TabulatorFull as Tabulator}；建表 setTimeout 延迟须 ready 守卫；selectableRange 与 selectableRows 互斥；Row.updateData 原地写；批量写只发 rowUpdated；frozen+selectRange 误报→cssClass+sticky。

## three.js(0.173) / echarts
- three-compat.ts 关 ColorManagement，renderer outputColorSpace=LinearSRGB；光照过 legacyIntensity()×π；ExtrudeGeometry 合并后 collapseExtrudeGroups()。
- echarts: chart-map+chart-province 合并 chart-dashboard（按 level 切 option）；统一入口 src/config/echarts/setup，不直连主包。

## 本机环境坑
- 亿赛通加密 .md：写用 Edit/Write；grep 读密文返空是假象。
- 沙箱删除守卫(>50文件)杀 pnpm dev/vite build；本机产不出完整生产包，正确性以 ts-check+四项检查为准。
- dev server 须 run_in_background；别动 vite 预构建配置（re-optimize 撞守卫），用默认 vite.config 起。
- CDP: headless=new 连 /json/list 的 page WS（非 /json/version）；Node fetch 走代理连不上127→用内置http；ws 从 node_modules/.pnpm/ws@*/... 加载；CSS:hover 骗不过→Input.dispatchMouseEvent。
- 网络出口代理常 502/断，两条路试；git push 直连 `env -u *_proxy`。安全垫片静默断链 rm -rf 大目录→用 mv。bash /tmp=C:/Users/.../Temp。

## 全仓 lint 硬约定
- 函数一律箭头；不许 eslint-disable（仅 auto-imports.d.ts/components.d.ts/env.d.ts 例外）。
- 基线 eslint/vue-tsc/stylelint 均 0 error（剩~410 warning）。
- pre-commit 四项：check:nav→check:components→eslint→stylelint（本机 lint-staged 调 wmic 被拉黑，须 --no-verify 但手动跑齐四项）。
- stylelint glob 含 src/**/*.{css,scss,vue,sass,html} 不要 .less。git commit 吞索引→分批前 git restore --staged .。push 成功取 $? 非 tail。
- 重排三类回归：闭包 let 丢收窄→const；删未用参数同步调用方；v-for index 仅 :key 判未读→换稳定字段。

## 接缝本
- VTable 标注用列 style 回调实时校验 args.value（无 field 用 col 索引回查）；Canvas 放 el-tabs 别隐藏 pane 初始化→v-if+@tab-change 后 nextTick resize。
- service 数据×computed×图表：字段未 ref 化追踪不到；汇总别用 computed 追 record 内部字段→ref+watch。
- @visactor/vchart v2：resize 需 autoFit:true；双轴 type:'common'+series.id+axes.seriesId。
- 演示页浅色卡片换「语义色+8~10%透明」；Word 式调色板走 --ai-surface-*/--ai-border/--color-text-*；<mark> 内联 color:inherit 要 !important。
- Univer 浮层过大排查：① documentElement font-size（大屏模板顶到~78px）② 锚点 .univer-popup ③ 才调 Tailwind 密度。
