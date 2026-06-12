/** * fab-button */
<template>
  <view
    class="tsm-fab-button"
    :class="getContainerClass"
    :style="customStyle"
    @click="
      () => {
        if (state !== 'disabled') {
          emit('click', $event);
        }
      }
    "
  >
    <view v-if="$slots.icon" class="tsm-fab-button__icon">
      <slot name="icon" />
    </view>
    <text class="tsm-fab-button__title" :class="getTextClass" v-if="title">{{ title }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { FabButtonProps } from './props';
import { defaultProps } from './props';

const props = withDefaults(defineProps<FabButtonProps>(), defaultProps);

const emit = defineEmits<{
  click: [e: Event];
}>();

const getContainerClass = computed(() =>
  [
    props.state !== 'disabled' ? `tsm-fab-button__type_${props.type}` : null,

    `tsm-fab-button__shape_${props.shape}`,

    props.state === 'disabled' && props.type === 'primary' ? 'tsm-fab-button__state_disabled' : null,
  ].filter(Boolean)
);

const getTextClass = computed(() =>
  [
    `tsm-fab-button__title_${props.type}`,

    props.state === 'disabled' && props.type === 'secondary' ? 'tsm-fab-button__title_secondary_disabled' : null,
  ].filter(Boolean)
);
</script>

<style scoped lang="scss">
.tsm-fab-button {
  position: fixed;
  right: 20px;
  bottom: 20px;
  display: flex;
  width: var(--tsm-spacing-7xl);
  height: var(--tsm-spacing-7xl);
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--tsm-spacing-none);
}

.tsm-fab-button__type_primary {
  background: var(--tsm-color-primary);
  box-shadow:
    0 -1px 8px 0 var(--tsm-shadow-l-04),
    0 12px 16px -4px var(--tsm-shadow-l-01),
    0 4px 6px -2px var(--tsm-shadow-l-02),
    0 2px 2px -1px var(--tsm-shadow-l-03);
}

.tsm-fab-button__type_primary:active {
  background: var(--tsm-color-primary-active);

  /* --tsm-shadow-l */
  box-shadow:
    0 4px 6px -2px var(--tsm-shadow-l-02),
    0 2px 2px -1px var(--tsm-shadow-l-03),
    0 -1px 8px 0 var(--tsm-shadow-l-04),
    0 12px 16px -4px var(--tsm-shadow-l-01);
}

.tsm-fab-button__type_secondary {
  background: var(--tsm-color-bg-white);
  box-shadow:
    0 -1px 8px 0 var(--tsm-shadow-l-04),
    0 12px 16px -4px var(--tsm-shadow-l-01),
    0 4px 6px -2px var(--tsm-shadow-l-02),
    0 2px 2px -1px var(--tsm-shadow-l-03);
}

.tsm-fab-button__type_secondary:active {
  background: var(--tsm-color-bg-tertiary);

  /* --tsm-shadow-l */
  box-shadow:
    0 4px 6px -2px var(--tsm-shadow-l-02),
    0 2px 2px -1px var(--tsm-shadow-l-03),
    0 -1px 8px 0 var(--tsm-shadow-l-04),
    0 12px 16px -4px var(--tsm-shadow-l-01);
}

.tsm-fab-button__state_default {
  background: var(--tsm-color-primary);
}

.tsm-fab-button__state_disabled {
  background: var(--tsm-color-primary-border);
}

.tsm-fab-button__shape_rectangle {
  border-radius: var(--tsm-radius-xl);
}

.tsm-fab-button__shape_circle {
  border-radius: var(--tsm-radius-full);
}

.tsm-fab-button__title_primary {
  color: var(--tsm-color-text-white);
}

.tsm-fab-button__title_secondary {
  color: var(--tsm-color-text-primary);
}

.tsm-fab-button__title_secondary_disabled {
  color: var(--tsm-color-text-disabled);
}

.tsm-fab-button__title {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  word-break: break-word;
  text-overflow: ellipsis;
  overflow: hidden;
  /* Caption-Semibold/c1 */
  font-family: var(--tsm-font-family-regular);
  font-size: var(--tsm-font-size-text-s);
  font-style: normal;
  font-weight: var(-tsm-font-weight-bold);
  line-height: var(--tsm-line-height-text-xs);
  /* 150% */
}
</style>
