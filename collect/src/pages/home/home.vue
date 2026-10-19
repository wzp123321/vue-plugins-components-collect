<template>
  <div class="hub">
    <section class="hub-hero">
      <div class="hub-hero__eyebrow">
        <span class="hub-hero__dot"></span>
        FRONTEND CAPABILITY LAB · {{ total }} DEMOS
      </div>
      <h1 class="hub-hero__title">
        把零散的前端能力<br />
        <span class="hub-hero__accent">收进一个控制台</span>
      </h1>
      <p class="hub-hero__desc">
        {{ groups.length }} 个能力域 · {{ total }} 个可运行示例 · Vue 3 / TypeScript / Vite
      </p>

      <button class="hub-hero__search" @click="openPalette">
        <ai-icon name="search" class="hub-hero__search-icon" />
        <span class="hub-hero__search-text">搜索组件、图表、3D、CSS 技法…</span>
        <span class="ai-kbd">Ctrl K</span>
      </button>
    </section>

    <section class="hub-grid">
      <router-link
        v-for="group in groups"
        :key="group.key"
        :to="firstPathOfGroup(group)"
        class="hub-card"
      >
        <div class="hub-card__top">
          <span class="hub-card__icon"><ai-icon :name="group.icon" /></span>
          <span class="hub-card__count">{{ countOfGroup(group) }}</span>
        </div>

        <h3 class="hub-card__title">{{ group.label }}</h3>
        <p class="hub-card__desc">{{ group.caption }}</p>

        <div class="hub-card__chips">
          <span v-for="section in group.sections" :key="section.label" class="hub-card__chip">
            {{ section.label }}
          </span>
        </div>

        <span class="hub-card__go">
          进入
          <ai-icon name="arrow" class="hub-card__go-icon" />
        </span>
      </router-link>
    </section>
  </div>
</template>

<script lang="ts" setup>
import AiIcon from '@/components/ai-icon/ai-icon.vue';
import { countOfGroup, firstPathOfGroup, navGroups, navTotal } from '@/views/layout/aside-box/constant';

defineOptions({
  name: 'HubHome',
});

const groups = navGroups;
const total = navTotal;

/** 交给外壳统一处理命令面板，避免首页再实现一份搜索 */
function openPalette() {
  window.dispatchEvent(new CustomEvent('ai-open-palette'));
}
</script>

<style lang="less" scoped>
.hub {
  display: flex;
  flex-direction: column;
  gap: 26px;
  padding: 12px 6px 28px;
}

/* ---------------- Hero ---------------- */
.hub-hero {
  position: relative;
  padding: 18px 4px 6px;

  &__eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 5px 10px;
    border: 1px solid var(--ai-border);
    border-radius: 999px;
    background: var(--ai-surface-raised);
    color: var(--ai-text-dim);
    font-family: var(--ai-font-mono);
    font-size: 10px;
    letter-spacing: 0.14em;
  }

  &__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--ai-accent-2);
    box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.14);
    animation: hub-pulse 2.4s ease-in-out infinite;
  }

  &__title {
    margin: 18px 0 0;
    color: var(--ai-text);
    font-size: 34px;
    font-weight: 600;
    letter-spacing: -0.01em;
    line-height: 1.28;
  }

  &__accent {
    background: var(--ai-gradient);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  &__desc {
    margin-top: 12px;
    color: var(--ai-text-dim);
    font-size: 13px;
    line-height: 1.7;
  }

  &__search {
    display: flex;
    align-items: center;
    gap: 12px;
    width: min(520px, 100%);
    height: 46px;
    margin-top: 22px;
    padding: 0 10px 0 16px;
    border: 1px solid var(--ai-border);
    border-radius: 13px;
    background: var(--ai-surface-raised);
    color: var(--ai-text-mute);
    font-family: var(--ai-font-sans);
    font-size: 13px;
    cursor: pointer;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;

    &:hover {
      border-color: rgba(124, 92, 255, 0.5);
      background: var(--ai-surface-hover);
      box-shadow: 0 0 0 4px rgba(124, 92, 255, 0.1);
    }
  }

  &__search-icon {
    font-size: 17px;
    color: var(--ai-accent);
  }

  &__search-text {
    flex: 1;
    text-align: left;
  }
}

/* ---------------- 能力域卡片 ---------------- */
.hub-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(272px, 1fr));
  gap: 14px;
}

.hub-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px;
  overflow: hidden;
  border: 1px solid var(--ai-border);
  border-radius: var(--ai-radius-md);
  background: var(--ai-surface-raised);
  text-decoration: none;
  transition: transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.22s ease, box-shadow 0.22s ease;

  &::after {
    content: '';
    position: absolute;
    top: -60px;
    right: -40px;
    width: 160px;
    height: 160px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(124, 92, 255, 0.18), transparent 68%);
    opacity: 0;
    transition: opacity 0.28s ease;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(124, 92, 255, 0.42);
    box-shadow: var(--ai-shadow-md);

    &::after {
      opacity: 1;
    }

    .hub-card__go {
      color: var(--ai-accent-2);
    }

    .hub-card__go-icon {
      transform: translateX(3px);
    }
  }

  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__icon {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border: 1px solid var(--ai-border);
    border-radius: 10px;
    background: var(--ai-gradient-soft);
    color: var(--ai-accent);
    font-size: 18px;
  }

  &__count {
    padding: 2px 8px;
    border: 1px solid var(--ai-hairline);
    border-radius: 999px;
    background: var(--ai-surface);
    color: var(--ai-text-mute);
    font-family: var(--ai-font-mono);
    font-size: 10.5px;
  }

  &__title {
    margin: 0;
    color: var(--ai-text);
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.01em;
    line-height: 1.4;
  }

  &__desc {
    margin: 0;
    color: var(--ai-text-dim);
    font-size: 12px;
    line-height: 1.6;
    white-space: normal;
  }

  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 2px;
  }

  &__chip {
    padding: 2px 8px;
    border: 1px solid var(--ai-hairline);
    border-radius: 6px;
    background: var(--ai-surface);
    color: var(--ai-text-mute);
    font-size: 10.5px;
    line-height: 16px;
  }

  &__go {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 4px;
    color: var(--ai-text-dim);
    font-size: 11.5px;
    font-weight: 500;
    transition: color 0.2s ease;
  }

  &__go-icon {
    font-size: 13px;
    transition: transform 0.2s ease;
  }
}

@keyframes hub-pulse {
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

@media (max-width: 720px) {
  .hub-hero__title {
    font-size: 26px;
  }
}
</style>
