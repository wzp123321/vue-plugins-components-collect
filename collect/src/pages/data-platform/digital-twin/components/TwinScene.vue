<!--
  数字孪生 —— 3D 场景容器
  ============================================================================
  只负责挂场景、转发选中事件、把外部选中同步成高亮。场景逻辑在 useTwinScene。
  点击设备 → emit('select', id)；父组件改 selectedId → 这里 watch 后 focus。
-->
<template>
  <div class="twin-scene">
    <div ref="containerRef" class="twin-scene__canvas"></div>

    <div class="twin-scene__hud">
      <span class="twin-scene__hint">拖拽旋转 · 滚轮缩放 · 点击设备联动右侧图表</span>
      <button type="button" class="twin-scene__btn" @click="resetView">重置视角</button>
    </div>

    <ul class="twin-scene__legend">
      <li v-for="item in STATUS_SUMMARY" :key="item.status">
        <i :style="{ background: item.color }"></i>
        {{ item.label }} {{ item.count }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useTwinScene } from '../useTwinScene';
import { STATUS_SUMMARY } from '../twin-data';

defineOptions({ name: 'TwinScene' });

const props = defineProps<{ selectedId: string }>();
const emit = defineEmits<{ (e: 'select', id: string): void }>();

const containerRef = ref<HTMLElement | null>(null);
const { focus, resetView } = useTwinScene(containerRef, {
  onSelect: (id) => emit('select', id),
});

watch(
  () => props.selectedId,
  (id) => focus(id),
);
</script>

<style lang="less" scoped>
.twin-scene {
  position: relative;
  min-height: 420px;
  overflow: hidden;
  border: 1px solid var(--ai-border);
  border-radius: var(--ai-radius-md);
  background: #080b14;

  &__canvas {
    position: absolute;
    inset: 0;
  }

  &__hud {
    position: absolute;
    top: 12px;
    right: 12px;
    left: 12px;
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
    pointer-events: none;
  }

  &__hint {
    padding: 4px 10px;
    font-size: 11px;
    color: #9aa7bd;
    background: rgb(8 11 20 / 72%);
    border: 1px solid rgb(255 255 255 / 8%);
    border-radius: 999px;
    backdrop-filter: blur(8px);
  }

  &__btn {
    padding: 4px 12px;
    font-size: 11px;
    color: #dbe3f4;
    cursor: pointer;
    pointer-events: auto;
    background: rgb(8 11 20 / 72%);
    border: 1px solid rgb(255 255 255 / 12%);
    border-radius: 999px;
    transition: border-color 0.2s ease;

    &:hover {
      border-color: rgb(124 92 255 / 60%);
    }
  }

  &__legend {
    position: absolute;
    right: 12px;
    bottom: 12px;
    display: flex;
    gap: 14px;
    padding: 6px 12px;
    margin: 0;
    font-size: 11px;
    color: #9aa7bd;
    list-style: none;
    background: rgb(8 11 20 / 72%);
    border: 1px solid rgb(255 255 255 / 8%);
    border-radius: 999px;
    backdrop-filter: blur(8px);

    li {
      display: flex;
      gap: 6px;
      align-items: center;
    }

    i {
      width: 7px;
      height: 7px;
      border-radius: 50%;
    }
  }
}
</style>
