<template>
  <aside class="ai-aside" :class="{ 'is-collapsed': collapsed }">
    <!-- 检索：83 个示例的快速过滤入口 -->
    <div v-if="!collapsed" class="ai-aside__search">
      <ai-icon name="search" class="ai-aside__search-icon" />
      <input
        v-model="query"
        class="ai-aside__search-input"
        type="text"
        placeholder="搜索示例 / 路径"
        spellcheck="false"
        @keydown.enter.prevent="goFirst"
        @keydown.esc="query = ''"
      />
      <button v-if="query" class="ai-aside__search-clear" title="清空" @click="query = ''">
        <ai-icon name="close" />
      </button>
    </div>
    <button v-else class="ai-aside__search-mini" title="搜索" @click="emit('expand')">
      <ai-icon name="search" />
    </button>

    <div ref="scrollRef" class="ai-aside__scroll">
      <!-- 检索态：跨分组平铺结果 -->
      <template v-if="query">
        <div class="ai-aside__hint">{{ results.length }} 个匹配</div>
        <button
          v-for="item in results"
          :key="item.path"
          class="ai-item ai-item--flat"
          :class="{ 'is-active': item.path === activePath }"
          @click="go(item.path)"
        >
          <span class="ai-item__dot"></span>
          <span class="ai-item__label">{{ item.label }}</span>
          <span class="ai-item__trail">{{ item.groupLabel }}</span>
        </button>
        <div v-if="results.length === 0" class="ai-aside__empty">没有匹配的示例</div>
      </template>

      <!-- 常态：能力域 → 分区 → 示例（合集页子示例为 searchOnly，不占菜单） -->
      <template v-else>
        <template v-for="group in menuList" :key="group.key">
          <!-- 只有一个条目的能力域直接当入口，不再套一层折叠 -->
          <button
            v-if="countOfGroup(group) === 1"
            class="ai-group-head ai-group-head--single"
            :class="{ 'is-active': activePath === firstPathOfGroup(group) }"
            :style="{ '--tone': group.tone }"
            :title="collapsed ? group.label : ''"
            @click="go(firstPathOfGroup(group))"
          >
            <span class="ai-group-head__icon"><ai-icon :name="group.icon" /></span>
            <template v-if="!collapsed">
              <span class="ai-group-head__label">{{ group.label }}</span>
              <span class="ai-group-head__count">1</span>
            </template>
          </button>

          <div v-else class="ai-group">
            <button
              class="ai-group-head"
              :class="{ 'is-open': isOpen(group.key) }"
              :style="{ '--tone': group.tone }"
              :title="collapsed ? group.label : ''"
              @click="toggleGroup(group.key)"
            >
              <span class="ai-group-head__icon"><ai-icon :name="group.icon" /></span>
              <template v-if="!collapsed">
                <span class="ai-group-head__label">{{ group.label }}</span>
                <span class="ai-group-head__count">{{ countOfGroup(group) }}</span>
                <ai-icon name="chevron" class="ai-group-head__chev" />
              </template>
            </button>

            <div v-show="!collapsed && isOpen(group.key)" class="ai-group__body">
              <div v-for="section in group.sections" :key="section.label" class="ai-section">
                <div class="ai-section__label">{{ section.label }}</div>
                <button
                  v-for="item in visibleItems(section)"
                  :key="item.path"
                  class="ai-item"
                  :class="{ 'is-active': item.path === activePath }"
                  @click="go(item.path)"
                >
                  <span class="ai-item__dot"></span>
                  <span class="ai-item__label">{{ item.label }}</span>
                  <span v-if="item.badge" class="ai-item__badge">{{ item.badge }}</span>
                </button>
              </div>
            </div>
          </div>
        </template>
      </template>
    </div>

    <div v-if="!collapsed" class="ai-aside__foot">
      <span class="ai-aside__pulse"></span>
      <span>{{ totalCount }} 个入口 · {{ navTotal }} 个示例</span>
    </div>
  </aside>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import AiIcon from '@/components/ai-icon/ai-icon.vue';
import { countOfGroup, firstPathOfGroup, navGroups, navTotal, searchNav, type NavGroup, type NavSection } from './constant';

defineOptions({
  name: 'AiAside',
});

const props = defineProps({
  menuList: {
    type: Array as () => NavGroup[],
    default: () => navGroups,
  },
  selectedMenu: {
    type: Array as () => string[],
    default: () => [],
  },
  collapsed: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (e: 'expand'): void;
}>();

const router = useRouter();
const query = ref('');
const scrollRef = ref<HTMLElement | null>(null);

const OPEN_STORAGE_KEY = 'ai-nav-open-groups';

const activePath = computed(() => props.selectedMenu?.[0] ?? '');
const totalCount = computed(() => props.menuList.reduce((sum, group) => sum + countOfGroup(group), 0));
const results = computed(() => searchNav(query.value));

/** 合集页内的子示例为 searchOnly，只进搜索索引，不在菜单里重复铺开 */
const visibleItems = (section: NavSection) => section.items.filter((item) => !item.searchOnly);

const loadOpenState = (): Record<string, boolean> => {
  try {
    const raw = localStorage.getItem(OPEN_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Record<string, boolean>;
  } catch {
    // 本地存储不可用时退化为默认展开策略
  }
  const initial: Record<string, boolean> = {};
  const activeGroup = navGroups.find((group) =>
    group.sections.some((section) => section.items.some((item) => item.path === activePath.value)),
  );
  navGroups.forEach((group) => {
    initial[group.key] = group.key === activeGroup?.key;
  });
  return initial;
};

/** 分组展开状态：首次进入只展开当前路由所在分组 */
const openMap = ref<Record<string, boolean>>(loadOpenState());

const persistOpenState = () => {
  try {
    localStorage.setItem(OPEN_STORAGE_KEY, JSON.stringify(openMap.value));
  } catch {
    // 忽略存储异常
  }
}

const isOpen = (key: string) => openMap.value[key] === true;

const toggleGroup = (key: string) => {
  openMap.value = { ...openMap.value, [key]: !isOpen(key) };
  persistOpenState();
}

const go = (path: string) => {
  query.value = '';
  if (path !== activePath.value) router.push({ path });
}

const goFirst = () => {
  const first = results.value[0];
  if (first) go(first.path);
}

/** 路由变化时，确保所属分组处于展开状态，并把激活项滚进可视区 */
watch(activePath, async (path) => {
  const group = props.menuList.find((item) =>
    item.sections.some((section) => section.items.some((entry) => entry.path === path)),
  );
  if (group && !isOpen(group.key)) {
    openMap.value = { ...openMap.value, [group.key]: true };
    persistOpenState();
  }
  await nextTick();
  scrollRef.value
    ?.querySelector('.ai-item.is-active')
    ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
});
</script>

<style lang="less" scoped>
.ai-aside {
  display: flex;
  flex-direction: column;
  width: var(--ai-aside-w);
  min-width: var(--ai-aside-w);
  height: 100%;
  min-height: 0;
  border-right: 1px solid var(--ai-border);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0) 38%),
    var(--ai-surface);
  backdrop-filter: blur(22px);
  transition: width 0.26s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.26s cubic-bezier(0.4, 0, 0.2, 1);

  &.is-collapsed {
    width: var(--ai-aside-w-collapsed);
    min-width: var(--ai-aside-w-collapsed);
  }

  &__search {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 14px 12px 6px;
    padding: 0 10px;
    height: 36px;
    border: 1px solid var(--ai-border);
    border-radius: 10px;
    background: var(--ai-surface-raised);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    &:focus-within {
      border-color: rgba(124, 92, 255, 0.55);
      box-shadow: 0 0 0 3px rgba(124, 92, 255, 0.14);
    }
  }

  &__search-icon {
    font-size: 15px;
    color: var(--ai-text-mute);
  }

  &__search-input {
    flex: 1;
    min-width: 0;
    height: 100%;
    border: 0;
    background: transparent;
    color: var(--ai-text);
    font-family: var(--ai-font-sans);
    font-size: 13px;
    line-height: normal;

    &::placeholder {
      color: var(--ai-text-mute);
    }
  }

  &__search-clear {
    display: grid;
    place-items: center;
    width: 18px;
    height: 18px;
    padding: 0;
    border: 0;
    border-radius: 5px;
    background: var(--ai-surface-hover);
    color: var(--ai-text-mute);
    font-size: 12px;
    cursor: pointer;

    &:hover {
      color: var(--ai-text);
    }
  }

  &__search-mini {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    margin: 12px auto 4px;
    border: 1px solid var(--ai-border);
    border-radius: 11px;
    background: var(--ai-surface-raised);
    color: var(--ai-text-dim);
    font-size: 16px;
    cursor: pointer;
    transition: color 0.2s ease, border-color 0.2s ease;

    &:hover {
      color: var(--ai-text);
      border-color: var(--ai-border-strong);
    }
  }

  &__scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 6px 0 16px;
    scrollbar-width: thin;
    scrollbar-color: var(--ai-border-strong) transparent;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 6px;
      background-color: transparent;
      transition: background-color 0.2s ease;
    }

    &:hover::-webkit-scrollbar-thumb {
      background-color: var(--ai-border-strong);
    }
  }

  &__hint {
    padding: 6px 16px 8px;
    color: var(--ai-text-mute);
    font-family: var(--ai-font-mono);
    font-size: 10.5px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  &__empty {
    padding: 20px 16px;
    color: var(--ai-text-mute);
    font-size: 12.5px;
    text-align: center;
  }

  &__foot {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: auto;
    padding: 12px 16px 14px;
    border-top: 1px solid var(--ai-hairline);
    color: var(--ai-text-mute);
    font-family: var(--ai-font-mono);
    font-size: 10.5px;
    letter-spacing: 0.04em;
  }

  &__pulse {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--ai-accent-2);
    box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.14);
    animation: ai-pulse 2.4s ease-in-out infinite;
  }
}

/* ---------- 分组头 ---------- */
.ai-group {
  margin-bottom: 2px;
}

.ai-group-head {
  display: flex;
  align-items: center;
  gap: 10px;
  width: calc(100% - 16px);
  height: 34px;
  margin: 2px 8px;
  padding: 0 10px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--ai-text-dim);
  font-family: var(--ai-font-sans);
  font-size: 13px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease;

  &:hover {
    background: var(--ai-surface-hover);
    color: var(--ai-text);
  }

  &.is-open,
  &--single.is-active {
    color: var(--ai-text);
  }

  &--single.is-active {
    background: var(--ai-gradient-soft);
  }

  &__icon {
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
    border-radius: 8px;
    background: color-mix(in srgb, var(--tone, #7c5cff) 15%, transparent);
    color: color-mix(in srgb, var(--tone, #7c5cff) 80%, var(--ai-text));
    font-size: 16px;
    transition: background 0.18s ease, color 0.18s ease, transform 0.18s ease;
  }

  &:hover &__icon {
    transform: scale(1.06);
  }

  &.is-open &__icon,
  &--single.is-active &__icon {
    background: color-mix(in srgb, var(--tone, #7c5cff) 24%, transparent);
    color: color-mix(in srgb, var(--tone, #7c5cff) 95%, #fff);
  }

  &__label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    letter-spacing: 0.01em;
  }

  &__count {
    padding: 0 6px;
    height: 18px;
    line-height: 17px;
    border: 1px solid var(--ai-hairline);
    border-radius: 6px;
    background: var(--ai-surface-raised);
    color: var(--ai-text-mute);
    font-family: var(--ai-font-mono);
    font-size: 10.5px;
  }

  &__chev {
    font-size: 14px;
    color: var(--ai-text-mute);
    transition: transform 0.22s ease;
  }

  &.is-open &__chev {
    transform: rotate(180deg);
  }
}

.ai-group__body {
  padding-bottom: 4px;
}

/* ---------- 分区 ---------- */
.ai-section {
  &__label {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px 4px 40px;
    color: var(--ai-text-mute);
    font-family: var(--ai-font-mono);
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;

    &::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--ai-hairline);
    }
  }
}

/* ---------- 条目 ---------- */
.ai-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  width: calc(100% - 16px);
  height: 32px;
  margin: 1px 8px;
  padding: 0 10px 0 42px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--ai-text-dim);
  font-family: var(--ai-font-sans);
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: background 0.16s ease, color 0.16s ease, transform 0.16s ease;

  &:hover {
    background: var(--ai-surface-hover);
    color: var(--ai-text);
    transform: translateX(2px);
  }

  &__dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.4;
    transition: opacity 0.16s ease, box-shadow 0.16s ease;
  }

  &__label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__trail {
    flex-shrink: 0;
    color: var(--ai-text-mute);
    font-family: var(--ai-font-mono);
    font-size: 10px;
  }

  &__badge {
    flex-shrink: 0;
    min-width: 16px;
    padding: 0 5px;
    height: 15px;
    line-height: 14px;
    border: 1px solid color-mix(in srgb, var(--ai-accent) 32%, transparent);
    border-radius: 5px;
    background: var(--ai-accent-soft);
    color: var(--ai-accent);
    font-family: var(--ai-font-mono);
    font-size: 9.5px;
    text-align: center;
  }

  &--flat {
    padding-left: 12px;
  }

  &.is-active {
    background: var(--ai-gradient-soft);
    color: var(--ai-text);
    font-weight: 500;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      width: 3px;
      height: 16px;
      border-radius: 3px;
      background: var(--ai-gradient);
      box-shadow: 0 0 12px rgba(124, 92, 255, 0.6);
      transform: translateY(-50%);
    }

    .ai-item__dot {
      opacity: 1;
      background: var(--ai-accent-2);
      box-shadow: 0 0 8px rgba(34, 211, 238, 0.8);
    }
  }
}

@keyframes ai-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.45;
    transform: scale(0.82);
  }
}

/* 收起态：只留图标轨道 */
.ai-aside.is-collapsed {
  .ai-group-head {
    justify-content: center;
    height: 40px;
    padding: 0;
    margin: 2px 10px;

    &__icon {
      width: 24px;
      height: 24px;
      font-size: 18px;
    }
  }

  .ai-item {
    justify-content: center;
    padding: 0;
    margin: 1px 10px;
    height: 34px;

    &__label,
    &__trail {
      display: none;
    }

    &__dot {
      width: 6px;
      height: 6px;
    }
  }

  .ai-section__label {
    padding-left: 12px;
    text-align: center;
    letter-spacing: 0.06em;
  }
}
</style>
