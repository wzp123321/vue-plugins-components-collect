<template>
  <div class="suspense-page">
    <h5>Suspense — 异步组件加载</h5>
    <el-alert type="info" :closable="false" style="margin-bottom: 20px">
      <code>Suspense</code> 是 Vue3 内置组件，配合 <code>defineAsyncComponent</code> 或 async setup 使用，
      在异步内容加载完成前展示 fallback 占位内容（loading 状态）。
    </el-alert>

    <el-row :gutter="20">
      <!-- defineAsyncComponent 演示 -->
      <el-col :span="12">
        <el-card>
          <template #header>① defineAsyncComponent + Suspense</template>
          <el-button type="primary" @click="loadAsync = true" :disabled="loadAsync">
            加载异步组件（模拟 1.5s 延迟）
          </el-button>
          <div v-if="loadAsync" style="margin-top:16px">
            <Suspense>
              <template #default>
                <AsyncHeavyComponent />
              </template>
              <template #fallback>
                <div class="loading-placeholder">
                  <el-icon class="is-loading"><Loading /></el-icon>
                  <span>组件加载中，请稍候...</span>
                </div>
              </template>
            </Suspense>
          </div>
          <pre class="code-block">{{ asyncComponentCode }}</pre>
        </el-card>
      </el-col>

      <!-- async setup 演示 -->
      <el-col :span="12">
        <el-card>
          <template #header>② async setup（顶层 await）</template>
          <el-button type="success" @click="loadAsyncSetup = true" :disabled="loadAsyncSetup">
            加载 async setup 组件
          </el-button>
          <div v-if="loadAsyncSetup" style="margin-top:16px">
            <Suspense>
              <template #default>
                <AsyncSetupComponent />
              </template>
              <template #fallback>
                <div class="loading-placeholder">
                  <el-icon class="is-loading"><Loading /></el-icon>
                  <span>数据加载中...</span>
                </div>
              </template>
            </Suspense>
          </div>
          <pre class="code-block">{{ asyncSetupCode }}</pre>
        </el-card>
      </el-col>

      <!-- 错误处理 -->
      <el-col :span="24" style="margin-top:20px">
        <el-card>
          <template #header>③ 配合 onErrorCaptured 捕获异步错误</template>
          <el-button type="danger" @click="loadErrorComp = true" :disabled="loadErrorComp">
            加载会报错的异步组件
          </el-button>
          <div v-if="loadErrorComp" style="margin-top:16px">
            <div v-if="asyncError" class="error-block">
              ❌ 捕获到错误：{{ asyncError }}
            </div>
            <Suspense v-else>
              <template #default>
                <AsyncErrorComponent />
              </template>
              <template #fallback>
                <div class="loading-placeholder">
                  <el-icon class="is-loading"><Loading /></el-icon>
                  <span>加载中...</span>
                </div>
              </template>
            </Suspense>
          </div>
          <pre class="code-block">{{ errorHandleCode }}</pre>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, defineAsyncComponent, onErrorCaptured, defineComponent, h } from 'vue';
import { Loading } from '@element-plus/icons-vue';

defineOptions({ name: 'SuspenseDemo' });

const loadAsync = ref(false);
const loadAsyncSetup = ref(false);
const loadErrorComp = ref(false);
const asyncError = ref('');

// ① defineAsyncComponent 异步组件
const AsyncHeavyComponent = defineAsyncComponent({
  loader: () =>
    new Promise((resolve) =>
      setTimeout(
        () =>
          resolve(
            defineComponent({
              setup: () => () =>
                h('div', { style: 'padding:16px;background:#f0f9eb;border-radius:8px;color:#67c23a' }, [
                  h('p', '✅ 异步组件加载成功！'),
                  h('p', { style: 'font-size:13px;color:#666' }, '此组件经过 1.5 秒延迟后才加载'),
                ]),
            }) as any,
          ),
        1500,
      ),
    ),
  delay: 200,
  timeout: 10000,
});

// ② async setup 组件（顶层 await）
const AsyncSetupComponent = defineComponent({
  async setup() {
    // 顶层 await，Suspense 会等待这里的 Promise
    const data = await new Promise<string>((resolve) => setTimeout(() => resolve('来自异步请求的用户数据'), 2000));
    return () =>
      h('div', { style: 'padding:16px;background:#ecf5ff;border-radius:8px;color:#409eff' }, [
        h('p', '✅ async setup 加载成功！'),
        h('p', { style: 'font-size:13px;color:#666' }, `数据：${data}`),
      ]);
  },
});

// ③ 会出错的异步组件
const AsyncErrorComponent = defineAsyncComponent({
  loader: () =>
    new Promise((_resolve, reject) => {
      setTimeout(() => reject(new Error('模拟网络请求失败！')), 1000);
    }),
});

// 捕获 Suspense 子组件的错误
onErrorCaptured((err: Error) => {
  asyncError.value = err.message;
  return false; // 阻止向上冒泡
});

const asyncComponentCode = `const AsyncComp = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  delay: 200,      // 延迟 200ms 后显示 loading
  timeout: 10000,  // 超时时间
})

// 父组件
<Suspense>
  <AsyncComp />
  <template #fallback>
    <LoadingSpinner />
  </template>
</Suspense>`;

const asyncSetupCode = `// 子组件内 - 顶层 await
<script setup>
const data = await fetchUserData() // 顶层 await
<\/script>

// 父组件用 Suspense 包裹即可自动处理 loading`;

const errorHandleCode = `// 父组件捕获 Suspense 内部错误
onErrorCaptured((err) => {
  errorMessage.value = err.message
  return false // 阻止错误继续向上冒泡
})`;
</script>

<style lang="less" scoped>
.suspense-page {
  padding: 20px;
  overflow-y: auto;
}

.loading-placeholder {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
  color: #909399;

  .el-icon {
    font-size: 20px;
  }
}

.error-block {
  padding: 16px;
  background: #fef0f0;
  border-radius: 8px;
  color: #f56c6c;
  border: 1px solid #fde2e2;
}

.code-block {
  background: #1e1e2e;
  color: #cdd6f4;
  border-radius: 8px;
  padding: 16px;
  font-size: 12px;
  line-height: 1.7;
  margin-top: 16px;
  overflow-x: auto;
  white-space: pre;
}
</style>
