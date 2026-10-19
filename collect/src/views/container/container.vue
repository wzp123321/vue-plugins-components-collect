<template>
  <div class="ai-shell">
    <!-- 氛围层：极光渐变 + 网格 -->
    <div class="ai-shell__bg" aria-hidden="true"></div>
    <div class="ai-shell__grid" aria-hidden="true"></div>

    <header class="ai-header">
      <button class="ai-icon-btn" :title="isCollapsed ? '展开导航' : '收起导航'" @click="toggleCollapse">
        <ai-icon name="panel" :class="['ai-icon-btn__glyph', { 'is-flipped': isCollapsed }]" />
      </button>

      <router-link to="/home" class="ai-brand">
        <span class="ai-brand__mark">
          <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="ai-brand-gradient" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#a78bfa" />
                <stop offset="0.52" stop-color="#7c5cff" />
                <stop offset="1" stop-color="#22d3ee" />
              </linearGradient>
            </defs>
            <rect x="1.5" y="1.5" width="29" height="29" rx="9.5" fill="url(#ai-brand-gradient)" fill-opacity="0.14" />
            <rect
              x="1.5"
              y="1.5"
              width="29"
              height="29"
              rx="9.5"
              stroke="url(#ai-brand-gradient)"
              stroke-opacity="0.55"
            />
            <path
              d="M9.5 22.5L16 9.5l6.5 13"
              stroke="url(#ai-brand-gradient)"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path d="M12.4 18.4h7.2" stroke="url(#ai-brand-gradient)" stroke-width="2" stroke-linecap="round" />
            <circle cx="16" cy="24.4" r="1.7" fill="#22d3ee" />
          </svg>
        </span>
        <span class="ai-brand__text">
          <strong>组件 &amp; 插件收集</strong>
          <small>FRONTEND CAPABILITY LAB</small>
        </span>
      </router-link>

      <div v-if="currentNav" class="ai-crumb">
        <span class="ai-crumb__group">{{ currentNav.groupLabel }}</span>
        <span class="ai-crumb__sep">/</span>
        <span class="ai-crumb__page">{{ currentNav.label }}</span>
      </div>

      <div class="ai-header__right">
        <button class="ai-search-trigger" title="打开命令面板" @click="openPalette">
          <ai-icon name="search" class="ai-search-trigger__icon" />
          <span class="ai-search-trigger__text">搜索 {{ totalCount }} 个示例</span>
          <span class="ai-kbd">Ctrl K</span>
        </button>

        <span class="ai-header__divider"></span>

        <button
          class="ai-icon-btn"
          :title="themeStore.isDark ? '切换到浅色' : '切换到深色'"
          @click="themeStore.toggleTheme()"
        >
          <ai-icon :name="themeStore.isDark ? 'sun' : 'moon'" class="ai-icon-btn__glyph" />
        </button>
      </div>
    </header>

    <div class="ai-body">
      <Aside
        :menuList="menuList"
        :selectedMenu="selectedMenu"
        :collapsed="isCollapsed"
        @expand="isCollapsed = false"
      />

      <main class="ai-main">
        <common-page-container>
          <router-view></router-view>
        </common-page-container>
      </main>
    </div>

    <!-- 命令面板 -->
    <transition name="ai-palette">
      <div v-if="paletteOpen" class="ai-palette" @click.self="closePalette">
        <div class="ai-palette__panel" role="dialog" aria-label="全局搜索">
          <div class="ai-palette__field">
            <ai-icon name="search" class="ai-palette__icon" />
            <input
              ref="paletteInput"
              v-model="paletteQuery"
              class="ai-palette__input"
              type="text"
              placeholder="搜索示例、组件、插件…"
              spellcheck="false"
              @keydown.down.prevent="move(1)"
              @keydown.up.prevent="move(-1)"
              @keydown.enter.prevent="choose"
              @keydown.esc.prevent="closePalette"
            />
            <span class="ai-kbd">ESC</span>
          </div>

          <div class="ai-palette__list">
            <button
              v-for="(item, index) in paletteResults"
              :key="item.path"
              class="ai-palette__item"
              :class="{ 'is-active': index === paletteIndex }"
              @click="go(item.path)"
              @mouseenter="paletteIndex = index"
            >
              <span class="ai-palette__label">{{ item.label }}</span>
              <span class="ai-palette__meta">{{ item.groupLabel }} / {{ item.sectionLabel }}</span>
              <span class="ai-palette__path">{{ item.path }}</span>
            </button>
            <div v-if="paletteResults.length === 0" class="ai-palette__empty">
              没有匹配结果，试试「打印」「ECharts」「CSS」
            </div>
          </div>

          <div class="ai-palette__foot">
            <span class="ai-palette__keys"><span class="ai-kbd">↑</span><span class="ai-kbd">↓</span> 选择</span>
            <span class="ai-palette__keys"><span class="ai-kbd">↵</span> 打开</span>
            <span class="ai-palette__count">{{ paletteResults.length }} 个结果</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AiIcon from '@/components/ai-icon/ai-icon.vue';
import Aside from '../layout/aside-box/aside-box.vue';
import { allNavItems, menuList, navTotal, searchNav } from '../layout/aside-box/constant';
import { useThemeStore } from '@/store/modules/useThemeStore';

defineOptions({
  name: 'AiShell',
});

const route = useRoute();
const router = useRouter();
const themeStore = useThemeStore();

const selectedMenu = ref<string[]>([route.path]);
const isCollapsed = ref(false);

const totalCount = navTotal;

/** 当前页面在导航中的位置，用于头部面包屑 */
const currentNav = computed(() => allNavItems.find((item) => item.path === route.path));

watch(
  () => route.path,
  (path) => {
    selectedMenu.value = [path];
  },
);

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value;
}

/* ---------------- 命令面板 ---------------- */
const paletteOpen = ref(false);
const paletteQuery = ref('');
const paletteIndex = ref(0);
const paletteInput = ref<HTMLInputElement | null>(null);

const paletteResults = computed(() => searchNav(paletteQuery.value).slice(0, 50));

watch(paletteQuery, () => {
  paletteIndex.value = 0;
});

async function openPalette() {
  paletteOpen.value = true;
  paletteQuery.value = '';
  paletteIndex.value = 0;
  await nextTick();
  paletteInput.value?.focus();
}

function closePalette() {
  paletteOpen.value = false;
}

function move(step: number) {
  if (paletteResults.value.length === 0) return;
  const next = paletteIndex.value + step;
  const max = paletteResults.value.length - 1;
  paletteIndex.value = next < 0 ? max : next > max ? 0 : next;
}

function choose() {
  const item = paletteResults.value[paletteIndex.value];
  if (item) go(item.path);
}

function go(path: string) {
  closePalette();
  if (path !== route.path) router.push({ path });
}

/** Ctrl/⌘ + K 唤起；Esc 关闭 */
function handleHotkey(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    if (paletteOpen.value) closePalette();
    else openPalette();
    return;
  }
  if (event.key === 'Escape' && paletteOpen.value) closePalette();
}

/** 首页搜索框通过自定义事件唤起面板 */
function handleExternalOpen() {
  openPalette();
}

onMounted(() => {
  window.addEventListener('keydown', handleHotkey);
  window.addEventListener('ai-open-palette', handleExternalOpen);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleHotkey);
  window.removeEventListener('ai-open-palette', handleExternalOpen);
});
</script>

<style lang="less" scoped>
.ai-shell {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--ai-bg);

  &__bg,
  &__grid {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  &__bg {
    background:
      radial-gradient(920px 520px at 6% -14%, var(--ai-glow-violet), transparent 62%),
      radial-gradient(820px 480px at 96% -12%, var(--ai-glow-cyan), transparent 64%),
      radial-gradient(760px 620px at 50% 120%, var(--ai-glow-blue), transparent 66%);
  }

  &__grid {
    background-image:
      linear-gradient(var(--ai-grid-line) 1px, transparent 1px),
      linear-gradient(90deg, var(--ai-grid-line) 1px, transparent 1px);
    background-size: 56px 56px;
    mask-image: radial-gradient(1200px 720px at 50% -4%, #000 18%, transparent 76%);
    -webkit-mask-image: radial-gradient(1200px 720px at 50% -4%, #000 18%, transparent 76%);
  }
}

/* ---------------- 头部 ---------------- */
.ai-header {
  position: relative;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 12px;
  height: var(--ai-header-h);
  min-height: var(--ai-header-h);
  padding: 0 16px;
  border-bottom: 1px solid var(--ai-border);
  background: var(--ai-surface);
  backdrop-filter: blur(22px);

  &__right {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
  }

  &__divider {
    width: 1px;
    height: 18px;
    background: var(--ai-border);
    margin: 0 2px;
  }
}

.ai-icon-btn {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  color: var(--ai-text-dim);
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;

  &:hover {
    background: var(--ai-surface-hover);
    color: var(--ai-text);
    border-color: var(--ai-border);
  }

  &__glyph {
    font-size: 17px;
    transition: transform 0.26s cubic-bezier(0.4, 0, 0.2, 1);

    &.is-flipped {
      transform: scaleX(-1);
    }
  }
}

.ai-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;

  &__mark {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    filter: drop-shadow(0 0 14px rgba(124, 92, 255, 0.35));

    svg {
      width: 100%;
      height: 100%;
    }
  }

  &__text {
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;

    strong {
      color: var(--ai-text);
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 0.01em;
      line-height: 1.1;
    }

    small {
      color: var(--ai-text-mute);
      font-family: var(--ai-font-mono);
      font-size: 9px;
      letter-spacing: 0.18em;
      line-height: 1;
      white-space: nowrap;
    }
  }
}

.ai-crumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 10px;
  padding-left: 16px;
  border-left: 1px solid var(--ai-border);
  font-size: 12px;

  &__group {
    color: var(--ai-text-mute);
  }

  &__sep {
    color: var(--ai-text-mute);
    opacity: 0.6;
  }

  &__page {
    color: var(--ai-text);
    font-weight: 500;
  }
}

.ai-search-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 34px;
  min-width: 230px;
  padding: 0 8px 0 12px;
  border: 1px solid var(--ai-border);
  border-radius: 10px;
  background: var(--ai-surface-raised);
  color: var(--ai-text-mute);
  font-family: var(--ai-font-sans);
  font-size: 12.5px;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease;

  &:hover {
    border-color: rgba(124, 92, 255, 0.5);
    background: var(--ai-surface-hover);
    color: var(--ai-text);
  }

  &__icon {
    font-size: 15px;
  }

  &__text {
    flex: 1;
    text-align: left;
  }
}

/* ---------------- 主体 ---------------- */
.ai-body {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1;
  min-height: 0;
}

.ai-main {
  display: flex;
  flex: 1;
  min-width: 0;
  min-height: 0;
  padding: 18px;
}

/* ---------------- 命令面板 ---------------- */
.ai-palette {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 12vh 24px 24px;
  background: rgba(4, 5, 9, 0.55);
  backdrop-filter: blur(6px);

  &__panel {
    width: min(660px, 100%);
    overflow: hidden;
    border: 1px solid var(--ai-border-strong);
    border-radius: var(--ai-radius-lg);
    background: var(--ai-surface-solid);
    box-shadow: var(--ai-shadow-lg);
  }

  &__field {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 18px;
    border-bottom: 1px solid var(--ai-hairline);
  }

  &__icon {
    font-size: 17px;
    color: var(--ai-accent);
  }

  &__input {
    flex: 1;
    min-width: 0;
    border: 0;
    background: transparent;
    color: var(--ai-text);
    font-family: var(--ai-font-sans);
    font-size: 15px;
    line-height: normal;

    &::placeholder {
      color: var(--ai-text-mute);
    }
  }

  &__list {
    max-height: 46vh;
    overflow-y: auto;
    padding: 8px;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 10px 12px;
    border: 0;
    border-radius: 10px;
    background: transparent;
    color: var(--ai-text-dim);
    text-align: left;
    cursor: pointer;
    transition: background 0.14s ease, color 0.14s ease;

    &.is-active {
      background: var(--ai-surface-hover);
      color: var(--ai-text);
    }
  }

  &__label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 13.5px;
    font-weight: 500;
  }

  &__meta {
    flex-shrink: 0;
    color: var(--ai-text-mute);
    font-size: 11px;
  }

  &__path {
    flex-shrink: 0;
    padding: 2px 6px;
    border-radius: 5px;
    background: var(--ai-surface-raised);
    color: var(--ai-text-mute);
    font-family: var(--ai-font-mono);
    font-size: 10px;
  }

  &__empty {
    padding: 26px 16px;
    color: var(--ai-text-mute);
    font-size: 12.5px;
    text-align: center;
  }

  &__foot {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 10px 16px;
    border-top: 1px solid var(--ai-hairline);
    color: var(--ai-text-mute);
    font-size: 11px;
  }

  &__keys {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  &__count {
    margin-left: auto;
    font-family: var(--ai-font-mono);
  }
}

.ai-palette-enter-active,
.ai-palette-leave-active {
  transition: opacity 0.18s ease;
}

.ai-palette-enter-active .ai-palette__panel {
  transition: transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.22s ease;
}

.ai-palette-enter-from,
.ai-palette-leave-to {
  opacity: 0;
}

.ai-palette-enter-from .ai-palette__panel {
  opacity: 0;
  transform: translateY(-10px) scale(0.985);
}

/* 窄屏收敛 */
@media (max-width: 960px) {
  .ai-crumb {
    display: none;
  }

  .ai-search-trigger {
    min-width: 0;

    &__text {
      display: none;
    }
  }
}
</style>
