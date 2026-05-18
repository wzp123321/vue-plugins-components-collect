<template>
  <div class="async-component-page">
    <h5>defineAsyncComponent — 异步组件懒加载</h5>
    <el-alert type="info" :closable="false" style="margin-bottom:20px">
      <code>defineAsyncComponent</code> 将组件拆分为独立 chunk，只在需要时才加载，
      有效减少首屏体积，提升加载性能。
    </el-alert>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>① 基础用法 — 按需加载</template>
          <div style="margin-bottom:16px">
            <el-button type="primary" @click="showBasic = true" :disabled="showBasic">
              加载基础异步组件
            </el-button>
            <el-button @click="showBasic = false" v-if="showBasic" style="margin-left:8px">卸载</el-button>
          </div>
          <div v-if="showBasic" style="border:1px solid #e4e7ed;border-radius:8px;padding:12px">
            <component :is="BasicAsyncComp" />
          </div>
          <pre class="code-block" style="margin-top:16px">{{ basicCode }}</pre>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>② 完整配置 — loading/error/超时</template>
          <el-button type="warning" @click="showFull = true" :disabled="showFull">
            加载（模拟 2s 延迟）
          </el-button>
          <div v-if="showFull" style="margin-top:12px">
            <Suspense>
              <component :is="FullAsyncComp" />
              <template #fallback>
                <div class="loading-box">
                  <el-icon class="is-loading"><Loading /></el-icon>
                  <span>加载中（delay 后出现）...</span>
                </div>
              </template>
            </Suspense>
          </div>
          <pre class="code-block" style="margin-top:16px">{{ fullCode }}</pre>
        </el-card>
      </el-col>

      <el-col :span="24" style="margin-top:16px">
        <el-card>
          <template #header>③ 路由懒加载 vs defineAsyncComponent 对比</template>
          <el-row :gutter="16">
            <el-col :span="12">
              <p class="sub-title">路由懒加载（推荐用于页面级组件）</p>
              <pre class="code-block">{{ routeLazyCode }}</pre>
            </el-col>
            <el-col :span="12">
              <p class="sub-title">defineAsyncComponent（推荐用于组件级懒加载）</p>
              <pre class="code-block">{{ asyncCompCode }}</pre>
            </el-col>
          </el-row>
          <el-row :gutter="16" style="margin-top:16px">
            <el-col :span="24">
              <p class="sub-title">④ 实际项目中的完整懒加载策略</p>
              <pre class="code-block">{{ strategyCode }}</pre>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, defineAsyncComponent, defineComponent, h } from 'vue';
import { Loading } from '@element-plus/icons-vue';

defineOptions({ name: 'AsyncComponentDemo' });

const showBasic = ref(false);
const showFull = ref(false);

// 模拟异步加载的组件
const BasicAsyncComp = defineAsyncComponent(
  () =>
    new Promise<any>((resolve) =>
      setTimeout(
        () =>
          resolve(
            defineComponent({
              setup: () => () =>
                h('div', { style: 'color:#409eff;font-weight:500' }, '✅ 基础异步组件已加载！此组件在点击按钮后才被下载'),
            }),
          ),
        800,
      ),
    ),
);

// 完整配置的异步组件
const FullAsyncComp = defineAsyncComponent({
  loader: () =>
    new Promise<any>((resolve) =>
      setTimeout(
        () =>
          resolve(
            defineComponent({
              setup: () => () =>
                h('div', { style: 'padding:12px;background:#f0f9eb;border-radius:8px;color:#67c23a' }, [
                  h('p', '✅ 完整配置异步组件加载成功！'),
                  h('p', { style: 'font-size:12px;color:#666;margin-top:4px' }, '已配置 delay=200ms，超时=5s，loading 和 error 组件'),
                ]),
            }),
          ),
        2000,
      ),
    ),
  delay: 200,       // 延迟多少毫秒后显示 loading 组件
  timeout: 5000,    // 超时时间，超出后显示 error 组件
  errorComponent: defineComponent({ setup: () => () => h('div', { style: 'color:red' }, '❌ 组件加载失败') }),
  loadingComponent: defineComponent({ setup: () => () => h('div', { style: 'color:#999' }, '加载中...') }),
});

const basicCode = `// 最简用法
const AsyncComp = defineAsyncComponent(
  () => import('./components/HeavyChart.vue')
)

// 在模板中直接使用
<component :is="AsyncComp" />
// 或者
<AsyncComp />`;

const fullCode = `const AsyncComp = defineAsyncComponent({
  // 工厂函数
  loader: () => import('./HeavyComp.vue'),

  // 加载中显示的组件
  loadingComponent: LoadingSpinner,

  // 加载失败显示的组件
  errorComponent: ErrorComponent,

  // 展示 loading 前的延迟（默认 200ms）
  delay: 200,

  // 超时时间，超出则展示 errorComponent
  timeout: 10000,
})`;

const routeLazyCode = `// router/index.ts
// 路由懒加载 — 自动代码分割
{
  path: '/heavy-page',
  component: () => import('../pages/HeavyPage.vue')
  // ↑ Vite/Webpack 自动将此页面打成独立 chunk
}

// 加 /* webpackChunkName: "heavy" */ 注释可命名 chunk
component: () => import(
  /* webpackChunkName: "heavy-page" */
  '../pages/HeavyPage.vue'
)`;

const asyncCompCode = `// 组件内懒加载（比如大图表、编辑器等）
import { defineAsyncComponent } from 'vue'

// 只在需要展示时才加载
const HeavyChart = defineAsyncComponent(
  () => import('./components/HeavyChart.vue')
)

// 条件渲染触发懒加载
<HeavyChart v-if="showChart" />`;

const strategyCode = `// 完整懒加载策略
// 1. 页面级：路由懒加载（自动）
// 2. 组件级：defineAsyncComponent + v-if 触发
// 3. 首屏关键路径：预加载
const UserProfile = defineAsyncComponent(() => import('./UserProfile.vue'))

// 预加载（鼠标 hover 时提前下载）
const preloadUserProfile = () => import('./UserProfile.vue')
<button @mouseover="preloadUserProfile" @click="show = true">查看资料</button>

// 4. 配合 Suspense 统一处理 loading 状态
// 5. 对超大组件（如 3D 场景）使用 shallowRef 避免深层响应式开销`;
</script>

<style lang="less" scoped>
.async-component-page {
  padding: 20px;
  overflow-y: auto;
}

.loading-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  color: #909399;
}

.sub-title {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #303133;
}

.code-block {
  background: #1e1e2e;
  color: #cdd6f4;
  border-radius: 8px;
  padding: 14px;
  font-size: 11.5px;
  line-height: 1.7;
  overflow-x: auto;
  white-space: pre;
}
</style>
