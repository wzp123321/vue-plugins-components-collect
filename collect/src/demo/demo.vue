<template>
  <el-button ref="triggerComp" @mouseenter="onTriggerEnter" @mouseleave="onTriggerLeave">悬浮我</el-button>

  <el-tooltip
    ref="tooltipRef"
    v-model:visible="visible"
    virtual-triggering
    :virtual-ref="virtualRef"
    placement="top"
    :fallback-placements="[]"
    :enterable="true"
    popper-class="keep-hover-tooltip"
    :popper-options="popperOptions"
  >
    <template #content>
      <div style="max-width: 240px">Tooltip 内容区域（鼠标移入不关闭）</div>
    </template>
  </el-tooltip>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import type { ComponentPublicInstance } from 'vue';
import { ElTooltip } from 'element-plus';

const visible = ref(false);
const isOverTrigger = ref(false);
const isOverPopper = ref(false);

let closeTimer: number | null = null;
const clearCloseTimer = () => {
  if (closeTimer != null) {
    window.clearTimeout(closeTimer);
    closeTimer = null;
  }
};
const scheduleClose = () => {
  clearCloseTimer();
  closeTimer = window.setTimeout(() => {
    if (!isOverTrigger.value && !isOverPopper.value) visible.value = false;
  }, 80);
};

const triggerComp = ref<ComponentPublicInstance | null>(null);
const triggerEl = computed(() => triggerComp.value?.$el as HTMLElement | undefined);
const virtualRef = computed(() => triggerEl.value);

const tooltipRef = ref<InstanceType<typeof ElTooltip> | null>(null);
let popperEl: HTMLElement | null = null;

const isInPopper = (t: EventTarget | null) => !!(t instanceof Node && popperEl?.contains(t));
const isInTrigger = (t: EventTarget | null) => !!(t instanceof Node && triggerEl.value?.contains(t));

const onTriggerEnter = async () => {
  isOverTrigger.value = true;
  visible.value = true;
  await nextTick();
  tooltipRef.value?.updatePopper?.();
};

const onTriggerLeave = (e: MouseEvent) => {
  isOverTrigger.value = false;
  if (isInPopper(e.relatedTarget)) return;
  scheduleClose();
};

const onPopperEnter = () => {
  isOverPopper.value = true;
  clearCloseTimer();
};

const onPopperLeave = (e: MouseEvent) => {
  isOverPopper.value = false;
  if (isInTrigger(e.relatedTarget)) return;
  scheduleClose();
};

const bindPopperHover = () => {
  popperEl?.removeEventListener('mouseenter', onPopperEnter);
  popperEl?.removeEventListener('mouseleave', onPopperLeave);

  popperEl = document.querySelector('.keep-hover-tooltip') as HTMLElement | null;
  if (!popperEl) return;

  popperEl.addEventListener('mouseenter', onPopperEnter);
  popperEl.addEventListener('mouseleave', onPopperLeave);
};

watch(visible, async (v) => {
  clearCloseTimer();
  if (!v) {
    isOverPopper.value = false;
    return;
  }
  await nextTick();
  bindPopperHover();
});

const onGlobalReposition = () => {
  if (!visible.value) return;
  tooltipRef.value?.updatePopper?.();
};

window.addEventListener('scroll', onGlobalReposition, true);
window.addEventListener('resize', onGlobalReposition);

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onGlobalReposition, true);
  window.removeEventListener('resize', onGlobalReposition);
  clearCloseTimer();
  popperEl?.removeEventListener('mouseenter', onPopperEnter);
  popperEl?.removeEventListener('mouseleave', onPopperLeave);
});

const popperOptions = {
  strategy: 'fixed',
  modifiers: [
    { name: 'flip', enabled: false },
    { name: 'offset', options: { offset: [0, 8] } },
  ],
};
</script>
