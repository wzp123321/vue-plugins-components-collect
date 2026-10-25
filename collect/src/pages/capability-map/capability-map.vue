<template>
  <div class="cap-map">
    <!-- 顶部：需求搜索 -->
    <section class="cap-hero">
      <div class="cap-hero__eyebrow">
        <span class="cap-hero__dot"></span>
        CAPABILITY MAP · {{ profileTotal }} 条能力 · {{ needTotal }} 条需求结论
      </div>
      <h1 class="cap-map__title">
        描述你的需求，<span class="cap-map__accent">而不是插件名</span>
      </h1>
      <p class="cap-hero__desc">
        每个条目都回答三件事：什么需求直接用、什么需求要自己封装、什么需求别用它。
      </p>
      <div class="cap-hero__search">
        <ai-icon name="search" class="cap-hero__search-icon" />
        <input
          v-model="query"
          class="cap-hero__input"
          type="text"
          placeholder="例如：单元格编辑校验 / 大文件断点续传 / AI 流式输出"
          spellcheck="false"
        />
        <button v-if="query" class="cap-hero__clear" title="清空" @click="query = ''">
          <ai-icon name="close" />
        </button>
      </div>

      <div v-if="!query" class="cap-hero__filters">
        <button
          v-for="option in filterOptions"
          :key="option.key"
          class="cap-hero__chip"
          :class="{ 'is-active': activeFilter === option.key }"
          @click="activeFilter = option.key"
        >
          {{ option.label }}
          <span class="cap-hero__chip-count">{{ option.count }}</span>
        </button>
      </div>
    </section>

    <!-- 搜索结果态 -->
    <section v-if="query" class="cap-results">
      <div class="cap-results__hint">{{ hits.length }} 条能力命中「{{ query }}」</div>
      <CapabilityCard v-for="profile in hits" :key="profile.path" :profile="profile" />
      <div v-if="hits.length === 0" class="cap-results__empty">
        没有命中的能力。这可能是个真缺口——记下来，按频率决定要不要补。
      </div>
    </section>

    <!-- 分组浏览态 -->
    <section v-else class="cap-groups">
      <div v-for="group in groupedProfiles" :key="group.key" class="cap-group">
        <div class="cap-group__head">
          <span class="cap-group__label">{{ group.label }}</span>
          <span class="cap-group__line"></span>
          <span class="cap-group__count">{{ group.profiles.length }}</span>
        </div>
        <div class="cap-group__grid">
          <CapabilityCard v-for="item in group.profiles" :key="item.path" :profile="item" />
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import AiIcon from '@/components/ai-icon/ai-icon.vue';
import CapabilityCard from './components/capability-card.vue';
import { searchProfiles } from '@/utils/semantic-search';
import { allNavItems, navGroups } from '@/views/layout/aside-box/constant';
import { capabilityProfiles } from '@/config/capability-profiles';

defineOptions({
  name: 'CapabilityMap',
});

const query = ref('');
const activeFilter = ref<string>('all');

const profileTotal = capabilityProfiles.length;
const needTotal = capabilityProfiles.reduce((sum, profile) => sum + profile.needs.length, 0);

/** path → 导航信息（分组/标题），画像本身不重复存这些 */
const navByKey = new Map(allNavItems.map((item) => [item.path, item]));

const visibleInGroup = (groupKey: string): boolean => activeFilter.value === 'all' || activeFilter.value === groupKey;

const hits = computed(() =>
  searchProfiles(query.value)
    .map((hit) => hit.profile)
    .filter((profile) => {
      const nav = navByKey.get(profile.path);
      return nav ? visibleInGroup(nav.groupKey) : false;
    }),
);

const filterOptions = computed(() => [
  { key: 'all', label: '全部', count: profileTotal },
  ...navGroups.map((group) => ({
    key: group.key,
    label: group.label,
    count: capabilityProfiles.filter((profile) => navByKey.get(profile.path)?.groupKey === group.key)
    .length,
  })),
]);

/** 分组浏览态：按能力域分组，组内保持导航顺序 */
const groupedProfiles = computed(() =>
  navGroups
    .map((group) => ({
      key: group.key,
      label: group.label,
      profiles: capabilityProfiles.filter(
        (profile) => navByKey.get(profile.path)?.groupKey === group.key,
      ),
    }))
    .filter((group) => group.profiles.length > 0),
);
</script>

<style lang="less" scoped>
.cap-map {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 12px 6px 28px;
}

.cap-map__title {
  margin: 16px 0 0;
  color: var(--ai-text);
  font-size: 30px;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.3;

  &__accent {
    background: var(--ai-gradient);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
}

/* ---------------- 顶部 ---------------- */
.cap-hero {
  position: relative;
  padding: 14px 4px 0;

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
  }

  &__desc {
    margin-top: 10px;
    color: var(--ai-text-dim);
    font-size: 13px;
    line-height: 1.7;
  }

  &__search {
    display: flex;
    align-items: center;
    gap: 12px;
    width: min(560px, 100%);
    height: 46px;
    margin-top: 20px;
    padding: 0 10px 0 16px;
    border: 1px solid var(--ai-border);
    border-radius: 13px;
    background: var(--ai-surface-raised);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    &:focus-within {
      border-color: rgba(124, 92, 255, 0.55);
      box-shadow: 0 0 0 4px rgba(124, 92, 255, 0.1);
    }
  }

  &__search-icon {
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
    font-size: 13.5px;

    &::placeholder {
      color: var(--ai-text-mute);
    }

    &:focus {
      outline: none;
    }
  }

  &__clear {
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    padding: 0;
    border: 0;
    border-radius: 6px;
    background: var(--ai-surface-hover);
    color: var(--ai-text-mute);
    font-size: 12px;
    cursor: pointer;

    &:hover {
      color: var(--ai-text);
    }
  }

  &__filters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 16px;
  }

  &__chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 28px;
    padding: 0 12px;
    border: 1px solid var(--ai-border);
    border-radius: 999px;
    background: var(--ai-surface-raised);
    color: var(--ai-text-dim);
    font-family: var(--ai-font-sans);
    font-size: 12px;
    cursor: pointer;
    transition: background 0.16s ease, color 0.16s ease, border-color 0.16s ease;

    &:hover {
      color: var(--ai-text);
    }

    &.is-active {
      background: var(--ai-gradient-soft);
      border-color: rgba(124, 92, 255, 0.4);
      color: var(--ai-text);
    }
  }

  &__chip-count {
    color: var(--ai-text-mute);
    font-family: var(--ai-font-mono);
    font-size: 10px;
  }
}

/* ---------------- 搜索结果态 ---------------- */
.cap-results {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__hint {
    color: var(--ai-text-mute);
    font-family: var(--ai-font-mono);
    font-size: 11px;
    letter-spacing: 0.08em;
  }

  &__empty {
    padding: 30px 16px;
    border: 1px dashed var(--ai-border);
    border-radius: var(--ai-radius-md);
    color: var(--ai-text-mute);
    font-size: 13px;
    text-align: center;
  }
}

/* ---------------- 分组浏览态 ---------------- */
.cap-group {
  &__head {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
  }

  &__label {
    color: var(--ai-text);
    font-size: 15px;
    font-weight: 600;
  }

  &__line {
    flex: 1;
    height: 1px;
    background: var(--ai-hairline);
  }

  &__count {
    color: var(--ai-text-mute);
    font-family: var(--ai-font-mono);
    font-size: 11px;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 12px;
  }
}
</style>
