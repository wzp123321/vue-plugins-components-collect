<template>
  <div class="keep-alive-page">
    <h5>KeepAlive — 路由缓存策略</h5>
    <el-alert type="info" :closable="false" style="margin-bottom: 20px">
      <code>&lt;KeepAlive&gt;</code>
      包裹的组件切换时不销毁，保留状态。 配合
      <code>include/exclude</code>
      精确控制缓存哪些组件。
    </el-alert>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>① 不缓存 vs 缓存对比</template>
          <div class="tab-bar">
            <el-button
              v-for="tab in tabs"
              :key="tab.name"
              :type="activeTab === tab.name ? 'primary' : ''"
              size="small"
              @click="activeTab = tab.name"
            >
              {{ tab.label }}
            </el-button>
          </div>

          <el-row :gutter="12" style="margin-top: 16px">
            <el-col :span="12">
              <div class="compare-label">❌ 无缓存（每次重置）</div>
              <component :is="currentComponent" :key="activeTab" />
            </el-col>
            <el-col :span="12">
              <div class="compare-label">✅ 有缓存（保留状态）</div>
              <KeepAlive>
                <component :is="currentComponent" />
              </KeepAlive>
            </el-col>
          </el-row>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>② include / exclude 精确控制</template>
          <pre class="code-block">{{ includeCode }}</pre>

          <el-divider />

          <template #footer>
            <div style="padding: 0 12px 12px">
              <p style="font-size: 13px; font-weight: 600; margin-bottom: 8px">
                ③ onActivated / onDeactivated 生命周期
              </p>
              <pre class="code-block">{{ lifecycleCode }}</pre>
            </div>
          </template>
        </el-card>
      </el-col>

      <el-col :span="24" style="margin-top: 16px">
        <el-card>
          <template #header>④ 路由级 KeepAlive（配合 router-view）</template>
          <pre class="code-block">{{ routerCode }}</pre>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, defineComponent, h } from 'vue';

defineOptions({ name: 'KeepAliveDemo' });

const activeTab = ref('Counter');

// 演示用的计数器组件
const CounterComp = defineComponent({
  name: 'Counter',
  setup() {
    const count = ref(0);
    return () =>
      h('div', { style: 'padding:12px;background:#f0f9ff;border-radius:8px' }, [
        h('p', { style: 'font-size:13px;margin-bottom:8px' }, `计数器：${count.value}`),
        h(
          'button',
          {
            style:
              'padding:4px 12px;border:1px solid #409eff;color:#409eff;border-radius:4px;cursor:pointer;background:#fff',
            onClick: () => count.value++,
          },
          '+1',
        ),
      ]);
  },
});

// 演示用的输入框组件
const InputComp = defineComponent({
  name: 'InputForm',
  setup() {
    const text = ref('');
    return () =>
      h('div', { style: 'padding:12px;background:#f6ffed;border-radius:8px' }, [
        h('p', { style: 'font-size:13px;margin-bottom:8px' }, '在此输入内容：'),
        h('input', {
          value: text.value,
          onInput: (e: Event) => {
            text.value = (e.target as HTMLInputElement).value;
          },
          style: 'border:1px solid #d9d9d9;border-radius:4px;padding:4px 8px;width:100%',
          placeholder: '切换 tab 后再切回来...',
        }),
        h('p', { style: 'font-size:12px;color:#999;margin-top:6px' }, `当前值：${text.value}`),
      ]);
  },
});

const tabs = [
  { name: 'Counter', label: '计数器' },
  { name: 'InputForm', label: '输入框' },
];

const componentMap: Record<string, any> = { Counter: CounterComp, InputForm: InputComp };
const currentComponent = ref(componentMap[activeTab.value]);

// 监听 tab 切换
import { watch } from 'vue';
watch(activeTab, (val) => {
  currentComponent.value = componentMap[val];
});

const includeCode = `<!-- 只缓存 UserList 和 OrderList -->
<KeepAlive include="UserList,OrderList">
  <component :is="currentView" />
</KeepAlive>

<!-- 排除 Login 不缓存 -->
<KeepAlive exclude="Login">
  <component :is="currentView" />
</KeepAlive>

<!-- 最多缓存 3 个组件实例（LRU 策略） -->
<KeepAlive :max="3">
  <component :is="currentView" />
</KeepAlive>`;

const lifecycleCode = `// 被 KeepAlive 包裹的组件专属生命周期
import { onActivated, onDeactivated } from 'vue'

onActivated(() => {
  // 每次组件被显示时触发
  // 替代 onMounted（缓存后 onMounted 不再重复触发）
  fetchLatestData()
})

onDeactivated(() => {
  // 每次组件被隐藏时触发（不是销毁）
  clearPolling()
})`;

const routerCode = `<!-- App.vue 或布局组件 -->
<router-view v-slot="{ Component, route }">
  <KeepAlive :include="cachedViews">
    <component :is="Component" :key="route.path" />
  </KeepAlive>
</router-view>

// 在路由 meta 中标记是否需要缓存
{
  path: '/user-list',
  component: UserList,
  meta: { keepAlive: true }  // 标记需要缓存
}

// store 中动态管理缓存列表
const cachedViews = ref<string[]>([])
// 进入路由时若 meta.keepAlive 则加入缓存列表
router.afterEach((to) => {
  if (to.meta?.keepAlive) {
    if (!cachedViews.value.includes(to.name as string)) {
      cachedViews.value.push(to.name as string)
    }
  }
})`;
</script>

<style lang="less" scoped>
.keep-alive-page {
  padding: 20px;
  overflow-y: auto;
}

.tab-bar {
  display: flex;
  gap: 8px;
}

.compare-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
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
