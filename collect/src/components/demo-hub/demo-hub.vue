<template>
  <div class="demo-hub">
    <div class="demo-hub__bar">
      <div class="demo-hub__tabs" role="tablist">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="demo-hub__tab"
          :class="{ 'is-active': tab.key === activeKey }"
          role="tab"
          :aria-selected="tab.key === activeKey"
          @click="switchTab(tab.key)"
        >
          <span v-if="tab.icon" class="demo-hub__tab-icon">{{ tab.icon }}</span>
          {{ tab.label }}
        </button>
      </div>
      <span class="demo-hub__count">{{ tabs.length }} 个示例</span>
    </div>

    <div class="demo-hub__stage">
      <component :is="activeTab.component" v-if="activeTab" />
      <div v-else class="demo-hub__missing">没有匹配的示例</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Component } from 'vue';

defineOptions({
  name: 'DemoHub',
});

export interface DemoHubTab {
  /** 标签 key，同时用作 ?tab= 深链参数 */
  key: string;
  label: string;
  icon?: string;
  component: Component;
}

const props = defineProps<{
  tabs: DemoHubTab[];
  /** 写入地址栏的 tab 查询参数名，默认 tab */
  queryKey?: string;
}>();

const route = useRoute();
const router = useRouter();

const storedKey = (): string => route.path;

const readStoredTab = (): string => {
  try {
    return sessionStorage.getItem(`demo-hub-tab:${storedKey()}`) ?? '';
  } catch {
    return '';
  }
}

const persistTab = (key: string) => {
  try {
    sessionStorage.setItem(`demo-hub-tab:${storedKey()}`, key);
  } catch {
    // 存储不可用时静默降级
  }
}

const initialKey = (): string => {
  const fromQuery = route.query[props.queryKey ?? 'tab'];
  if (typeof fromQuery === 'string' && props.tabs.some((tab) => tab.key === fromQuery)) {
    return fromQuery;
  }
  const stored = readStoredTab();
  if (stored && props.tabs.some((tab) => tab.key === stored)) {
    return stored;
  }
  return props.tabs[0]?.key ?? '';
}

const activeKey = ref(initialKey());

const activeTab = computed(() => props.tabs.find((tab) => tab.key === activeKey.value));

/** 从外部跳转（命令面板 / 侧边栏搜索）进来时响应 tab 变化 */
watch(
  () => route.query[props.queryKey ?? 'tab'],
  (value) => {
    if (typeof value === 'string' && props.tabs.some((tab) => tab.key === value)) {
      activeKey.value = value;
    }
  },
);

const switchTab = (key: string) => {
  activeKey.value = key;
  persistTab(key);
  // 同步地址栏，保证合集页内的示例可收藏、可分享
  router.replace({
    path: route.path,
    query: { ...route.query, [props.queryKey ?? 'tab']: key },
  });
}
</script>

<style lang="less" scoped>
.demo-hub {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;

  &__bar {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
    padding: 12px 16px;
    border-bottom: 1px solid var(--ai-hairline);
  }

  &__tabs {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px;
    border: 1px solid var(--ai-border);
    border-radius: 12px;
    background: var(--ai-surface-raised);
    overflow-x: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  &__tab {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 30px;
    padding: 0 14px;
    border: 0;
    border-radius: 9px;
    background: transparent;
    color: var(--ai-text-dim);
    font-family: var(--ai-font-sans);
    font-size: 12.5px;
    font-weight: 500;
    white-space: nowrap;
    cursor: pointer;
    transition: background 0.16s ease, color 0.16s ease, box-shadow 0.16s ease;

    &:hover {
      color: var(--ai-text);
      background: var(--ai-surface-hover);
    }

    &.is-active {
      background: var(--ai-gradient-soft);
      color: var(--ai-text);
      box-shadow: inset 0 0 0 1px rgba(124, 92, 255, 0.25);
    }
  }

  &__tab-icon {
    font-size: 13px;
  }

  &__count {
    flex-shrink: 0;
    margin-left: auto;
    color: var(--ai-text-mute);
    font-family: var(--ai-font-mono);
    font-size: 10.5px;
    letter-spacing: 0.06em;
  }

  &__stage {
    flex: 1;
    min-height: 0;
    overflow: auto;
  }

  &__missing {
    padding: 40px 16px;
    color: var(--ai-text-mute);
    text-align: center;
    font-size: 13px;
  }
}
</style>
