<!--
  懒渲染容器
  ============================================================================
  职责：包住一个报表展示单元，未滚动到视口前只渲染骨架屏，命中视口后才挂载真实内容，
        并在标题右侧显示「待滚动到视口 / 已渲染 xx ms」，让懒加载行为肉眼可见。

  依赖 useInViewRender（一次性命中，不回收）。命中后会 emit('rendered', index)，
  由页面统计「已渲染 n / 总数」。
-->
<template>
  <section ref="wrapRef" class="lazy-section">
    <header class="lazy-section__head">
      <span class="lazy-section__idx">{{ index }}</span>
      <div class="lazy-section__titles">
        <h6 class="lazy-section__title">{{ title }}</h6>
        <p class="lazy-section__desc">{{ desc }}</p>
      </div>
      <div class="lazy-section__meta">
        <el-tag v-if="tag" size="small" effect="plain" type="info">{{ tag }}</el-tag>
        <span :class="['lazy-section__badge', { 'is-ready': visible }]">
          <i class="lazy-section__dot"></i>
          {{ visible ? `已渲染 ${cost}ms` : '待滚动到视口' }}
        </span>
      </div>
    </header>

    <div class="lazy-section__body" :style="{ minHeight: `${minHeight}px` }">
      <div v-if="!visible" class="lazy-section__skeleton">
        <span class="sk-bar sk-bar--title"></span>
        <span class="sk-bar"></span>
        <span class="sk-bar sk-bar--short"></span>
        <span class="sk-hint">滚动到此区域后渲染</span>
      </div>
      <slot v-else />
    </div>
  </section>
</template>

<script lang="ts" setup>
import { nextTick, ref, watch } from 'vue';
import { useInViewRender } from '@/hooks';

defineOptions({ name: 'LazySection' });

const props = withDefaults(
  defineProps<{
    index: number;
    title: string;
    desc: string;
    tag?: string;
    minHeight?: number;
  }>(),
  { tag: '', minHeight: 300 },
);

const emit = defineEmits<{ (e: 'rendered', index: number): void }>();

const wrapRef = ref<HTMLElement>();
const { visible, hitAt } = useInViewRender(wrapRef);
const cost = ref(0);

watch(visible, async (ready) => {
  if (!ready) return;
  await nextTick();
  requestAnimationFrame(() => {
    cost.value = Math.max(1, Math.round(performance.now() - hitAt.value));
    emit('rendered', props.index);
  });
});
</script>

<style lang="less" scoped>
.lazy-section {
  position: relative;
  padding: 16px 18px 18px;
  margin-bottom: 18px;
  border: 1px solid var(--ai-border);
  border-radius: var(--ai-radius-md);
  background: var(--ai-surface-raised);
  transition: border-color 0.25s ease;

  &:hover {
    border-color: var(--ai-border-strong);
  }

  &__head {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    padding-bottom: 12px;
    margin-bottom: 14px;
    border-bottom: 1px dashed var(--ai-hairline);
  }

  &__idx {
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    width: 24px;
    height: 24px;
    margin-top: 2px;
    font-family: var(--ai-font-mono);
    font-size: 12px;
    color: var(--ai-accent);
    background: var(--ai-accent-soft);
    border-radius: var(--ai-radius-xs);
  }

  &__titles {
    flex: 1;
    min-width: 0;
  }

  &__title {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--ai-text);
  }

  &__desc {
    margin: 4px 0 0;
    font-size: 12px;
    line-height: 1.6;
    color: var(--ai-text-mute);
  }

  &__meta {
    display: flex;
    flex: 0 0 auto;
    gap: 8px;
    align-items: center;
  }

  &__badge {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    padding: 3px 9px;
    font-family: var(--ai-font-mono);
    font-size: 11px;
    color: var(--ai-text-mute);
    white-space: nowrap;
    border: 1px solid var(--ai-hairline);
    border-radius: 999px;

    &.is-ready {
      color: var(--ai-text-dim);
      border-color: var(--ai-border-strong);
      background: var(--ai-surface-active);
    }
  }

  &__dot {
    width: 6px;
    height: 6px;
    background: var(--ai-text-mute);
    border-radius: 50%;
  }

  &__badge.is-ready &__dot {
    background: #38d39f;
    box-shadow: 0 0 0 3px rgb(56 211 159 / 18%);
  }

  &__body {
    position: relative;
  }

  &__skeleton {
    display: flex;
    flex-direction: column;
    gap: 10px;
    justify-content: center;
    height: 100%;
    padding: 24px 8px;
    color: var(--ai-text-mute);
  }
}

.sk-bar {
  height: 14px;
  background: linear-gradient(90deg, var(--ai-surface-hover) 25%, var(--ai-surface-active) 50%, var(--ai-surface-hover) 75%);
  background-size: 200% 100%;
  border-radius: var(--ai-radius-xs);
  animation: sk-shimmer 1.4s ease-in-out infinite;

  &--title {
    width: 38%;
    height: 18px;
  }

  &--short {
    width: 62%;
  }
}

.sk-hint {
  margin-top: 6px;
  font-size: 12px;
  letter-spacing: 0.04em;
  color: var(--ai-text-mute);
}

@keyframes sk-shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}
</style>
