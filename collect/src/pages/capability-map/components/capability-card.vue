<template>
  <article class="cap-card" :class="{ 'is-dim': !expanded }">
    <header class="cap-card__head">
      <router-link :to="profile.path" class="cap-card__title">
        {{ navLabel }}
        <ai-icon name="arrow" class="cap-card__go" />
      </router-link>
      <button
        class="cap-card__toggle"
        :title="expanded ? '收起' : '展开全部需求结论'"
        @click="expanded = !expanded"
      >
        {{ expanded ? '收起' : `+${hiddenCount}` }}
      </button>
    </header>

    <p class="cap-card__positioning">{{ profile.positioning }}</p>

    <div v-if="profile.usage" class="cap-card__usage">
      <code v-if="profile.usage.install" class="cap-card__install">{{ profile.usage.install }}</code>
      <router-link :to="demoTarget" class="cap-card__demo">看 demo ↗</router-link>
      <ul v-if="profile.usage.keyApi?.length" class="cap-card__apis">
        <li v-for="api in profile.usage.keyApi" :key="api" class="cap-card__api">{{ api }}</li>
      </ul>
    </div>

    <ul class="cap-card__needs">
      <li v-for="need in visibleNeeds" :key="need.text" class="cap-card__need" :data-level="need.level">
        <span class="cap-card__mark">{{ levelMark[need.level] }}</span>
        <span class="cap-card__need-text">
          {{ need.text }}
          <em v-if="need.comment" class="cap-card__comment">{{ need.comment }}</em>
        </span>
      </li>
    </ul>

    <ul v-if="profile.notes?.length && expanded" class="cap-card__notes">
      <li v-for="note in profile.notes" :key="note">{{ note }}</li>
    </ul>

    <pre v-if="profile.usage?.snippet && expanded" class="cap-card__snippet"><code>{{ profile.usage.snippet }}</code></pre>

    <footer v-if="profile.alternatives?.length && expanded" class="cap-card__alts">
      <span class="cap-card__alts-label">同类方案</span>
      <router-link
        v-for="alt in resolvableAlternatives"
        :key="alt"
        :to="alt"
        class="cap-card__alt"
      >
        {{ navTitleOf(alt) }}
      </router-link>
    </footer>
  </article>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import AiIcon from '@/components/ai-icon/ai-icon.vue';
import type { CapabilityProfile } from '@/config/capability-profiles';
import { allNavItems } from '@/views/layout/aside-box/constant';

defineOptions({
  name: 'CapabilityCard',
});

const props = defineProps<{
  profile: CapabilityProfile;
}>();

const levelMark: Record<CapabilityProfile['needs'][number]['level'], string> = {
  fits: '✅',
  partial: '⚠️',
  no: '❌',
};

const DEFAULT_VISIBLE = 3;
const expanded = ref(false);

const navItem = allNavItems.find((item) => item.path === props.profile.path);
const navLabel = navItem?.label ?? props.profile.path;

const visibleNeeds = computed(() =>
  expanded.value ? props.profile.needs : props.profile.needs.slice(0, DEFAULT_VISIBLE),
);

const hiddenCount = computed(() => Math.max(0, props.profile.needs.length - DEFAULT_VISIBLE));

const resolvableAlternatives = computed(
  () => props.profile.alternatives?.filter((alt) => alt !== props.profile.path) ?? [],
);

const demoTarget = computed(() => props.profile.usage?.demoPath ?? props.profile.path);

const navTitleOf = (path: string): string => allNavItems.find((item) => item.path === path)?.label ?? path;
</script>

<style lang="less" scoped>
.cap-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  border: 1px solid var(--ai-border);
  border-radius: var(--ai-radius-md);
  background: var(--ai-surface-raised);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    border-color: rgba(124, 92, 255, 0.38);
    box-shadow: var(--ai-shadow-md);
  }

  &__head {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__title {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--ai-text);
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;

    &:hover {
      color: var(--ai-accent);
    }
  }

  &__go {
    font-size: 12px;
    color: var(--ai-text-mute);
    transition: transform 0.18s ease, color 0.18s ease;
  }

  &__title:hover &__go {
    color: var(--ai-accent);
    transform: translateX(2px);
  }

  &__toggle {
    margin-left: auto;
    height: 22px;
    padding: 0 8px;
    border: 1px solid var(--ai-hairline);
    border-radius: 6px;
    background: var(--ai-surface);
    color: var(--ai-text-mute);
    font-family: var(--ai-font-mono);
    font-size: 10.5px;
    cursor: pointer;
    transition: color 0.16s ease, border-color 0.16s ease;

    &:hover {
      color: var(--ai-text);
      border-color: var(--ai-border-strong);
    }
  }

  &__positioning {
    margin: 0;
    color: var(--ai-text-dim);
    font-size: 12px;
    line-height: 1.6;
  }

  &__needs {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__need {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 12.5px;
    line-height: 1.55;
  }

  &__mark {
    flex-shrink: 0;
    font-size: 12px;
    line-height: 1.55;
  }

  &__need-text {
    color: var(--ai-text-dim);

    /* ✅ 可直接用的需求句给正文色，其余保持弱化 */
    .cap-card__need[data-level='fits'] & {
      color: var(--ai-text);
    }
  }

  &__comment {
    margin-left: 4px;
    color: var(--ai-text-mute);
    font-size: 11.5px;
    font-style: normal;
  }

  &__notes {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin: 0;
    padding: 10px 12px;
    border-radius: var(--ai-radius-sm);
    background: var(--ai-surface);
    border: 1px solid var(--ai-hairline);
    color: var(--ai-text-mute);
    font-size: 11.5px;
    line-height: 1.6;

    li::before {
      content: '· ';
      color: var(--ai-accent);
    }
  }

  /* ---------------- 详细应用（用法面） ---------------- */
  &__usage {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 10px 12px;
    border-radius: var(--ai-radius-sm);
    background: var(--ai-surface);
    border: 1px solid var(--ai-hairline);
  }

  &__install {
    align-self: flex-start;
    padding: 4px 8px;
    border-radius: 6px;
    background: var(--ai-code-bg, rgba(124, 92, 255, 0.1));
    color: var(--ai-accent);
    font-family: var(--ai-font-mono);
    font-size: 11px;
    white-space: pre-wrap;
    word-break: break-all;
  }

  &__demo {
    align-self: flex-start;
    color: var(--ai-text-dim);
    font-size: 11.5px;
    text-decoration: none;

    &:hover {
      color: var(--ai-accent);
    }
  }

  &__apis {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__api {
    padding: 2px 7px;
    border-radius: 5px;
    border: 1px solid var(--ai-hairline);
    background: var(--ai-surface-raised);
    color: var(--ai-text-mute);
    font-family: var(--ai-font-mono);
    font-size: 10.5px;
  }

  &__snippet {
    margin: 0;
    padding: 12px;
    border-radius: var(--ai-radius-sm);
    background: var(--ai-code-bg, rgba(15, 18, 28, 0.6));
    border: 1px solid var(--ai-hairline);
    color: var(--ai-text-dim);
    font-family: var(--ai-font-mono);
    font-size: 11px;
    line-height: 1.6;
    white-space: pre;
    overflow-x: auto;
  }

  &__alts {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
  }

  &__alts-label {
    color: var(--ai-text-mute);
    font-size: 11px;
  }

  &__alt {
    padding: 2px 8px;
    border: 1px solid var(--ai-hairline);
    border-radius: 6px;
    background: var(--ai-surface);
    color: var(--ai-text-dim);
    font-size: 11px;
    text-decoration: none;
    transition: color 0.16s ease, border-color 0.16s ease;

    &:hover {
      color: var(--ai-accent);
      border-color: rgba(124, 92, 255, 0.4);
    }
  }
}
</style>
