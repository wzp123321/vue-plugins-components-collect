# CLAUDE.md — collect 工程接手手册

前端能力收集站（Vue3 + Vite + TS + Element Plus）。这里既是组件库，也是能跑起来的 demo 站。
人和 Agent 读同一份约定。

## 命令

```bash
pnpm dev            # 开发（端口见 .env 的 VITE_DEV_SERVER_PORT）
pnpm gen            # 重新生成 src/components.d.ts + src/auto-imports.d.ts
pnpm ts-check       # vue-tsc --noEmit
pnpm build          # gen → ts-check → vite build（串行，类型错误会阻断出包）
pnpm check:nav      # 导航 ↔ 路由一致性校验
pnpm check:components  # 模板组件解析校验（漏 import 会渲染为空）
```

## 目录职责（关键，先看这张表再看代码）

| 目录 | 是什么 | 能不能加业务代码 |
|---|---|---|
| `src/components/<name>/` | **组件本体**（`<name>.vue` + `index.ts` 出口） | 能，这是唯一真相 |
| `src/pages/<domain>/<name>/` | **演示页**，import 组件本体 | 只放演示与交互，不复制组件实现 |
| `src/components/_mock/` | 组件共用 mock 数据，唯一一份 | 能 |
| `src/router/modules/` | 路由，按域分文件 | 能 |
| `src/views/layout/aside-box/constant.ts` | 侧边栏导航 | 能，但必须与路由同步 |
| `src/services/http/` | 可整目录复制的 axios 请求层模板 | 尽量不改，改了就同步 README |
| `scripts/` | 校验脚本（导航守卫等） | 能 |

## 三条踩过的坑

**1. `pages/` 下与组件同名的 `.vue` 不是副本。**
`src/pages/components/te-title/te-title.vue` 和 `src/components/te-title/src/te-title.vue` 同名，
前者是 demo 壳（内部 `defineOptions({ name: 'TeTitleDemo' })`，import 后者）。
判定是不是副本，**必须查 import 关系**，不能只看文件名和行数 diff —— 静态审查在这里误判过两次。

**2. `unplugin-vue-components` 只扫 `src/components`。**
`src/pages/**` 下的子组件靠标签名自动解析会**静默失败**（控制台 `Failed to resolve component`，页面渲染为空）。
pages 内引用同目录子组件必须显式 `import`。

**3. 导航与路由是双注册。**
加页面要同时改 `router/modules/*.ts` 和 `aside-box/constant.ts`，漏一处 `pnpm check:nav` 会拦。

## 请求层

`src/services/http/` 是**可整目录复制**的模板，只依赖 axios，不含 Vue/Pinia/Element Plus：

```
types.ts  errors.ts  token-manager.ts  interceptors.ts  client.ts  index.ts
```

业务接线示例在 `src/services/request.ts`（改单例配置，不改模板本体）。
配置项速查与 6 条反模式见 `src/services/http/README.md`。

要点：
- 业务码（`errcode !== '0'`）抛 `BizError`，网络/状态码问题抛 `HttpError`，两者都带原始 `config`/`body`
- 401 只重试一次；重试只打幂等方法（`retry.idempotentOnly` 默认 true）
- 后端字段差异用 `getCode` / `getMessage` / `successCodes` 适配，不改模板

## 能力画像（需求 → 工具倒排）

`src/config/capability-profiles.ts` 是全站的「需求画像」：每个条目回答什么需求直接用（fits）、
什么要自己封装（partial）、什么别用（no）。**新示例进站必须同步补一条 profile**；
`/capability-map` 能力地图页与命令面板检索都吃这份数据，需求句改动要同步更新。

## 风格

- 组件目录四件套：`index.ts`（带 `withInstall` 风格出口）/ `src/<name>.vue` / 类型 / composable
- 组件名 `defineOptions({ name: 'Xxx' })`；**demo 页统一加 `Demo` 后缀**
- **同域小示例用 `src/components/demo-hub/` 聚合成合集页**（标签容器，`?tab=` 深链），
  菜单只放合集入口；合集内子示例在 `aside-box/constant.ts` 标 `searchOnly: true`（只进搜索索引）。
  被合并的旧路由保留为 redirect；带 WebGL/渲染循环的 demo 必须补 `onBeforeUnmount` 清理（参考 threejs-lab / babylon-lab）
- 路径别名 `@/` 可用，但 pages 内引用跨目录组件目前用相对路径，保持一致即可
- 不留被注释掉的 import；不用 `require()`（走 ESM）
- 不写行内静态样式，样式放 `<style lang="less" scoped>`
