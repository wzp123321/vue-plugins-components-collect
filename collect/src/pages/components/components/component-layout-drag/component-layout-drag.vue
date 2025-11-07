<template>
  <div class="ber-drag-resize" :style="{ height: `${height}px` }">
    <div
      class="bdr-drag-handler"
      @mouseenter="enterHandler"
      @mouseleave="leaveHandler"
      :draggable="true"
      @dragstart="dragStart"
      @drag="dragMove"
      @dragend="dragEnd"
    ></div>
    <div class="bdr-content">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { throttle } from 'lodash-es';

defineOptions({
  name: 'BerDragResize',
});
const emits = defineEmits(['resize']);

interface Props {
  defaultValue?: number;
}

const props = withDefaults(defineProps<Props>(), {
  defaultValue: 240,
});

const borderColor = ref('var(--te-border-color-lighter)');
const offsetTop = ref(0);
const height = ref(props.defaultValue);
// 每次按下的clientY
const initialClientY = ref(0);

/**
 * 1、每次开始拖拽时记住当前光标相对于视口的y值
 * 2、开始拖拽时，实时计算高度，高度等于初始高度+上一次高度差+本次高度差
 * 3、结束拖拽时记录累计高度差
 */
// 开始拖拽
const dragStart = (e: DragEvent) => {
  initialClientY.value = e.clientY;
};
// 拖拽移动
const dragMove = throttle((e: DragEvent) => {
  if (e.clientX < 0) return;
  borderColor.value = 'var(--te-border-color-dark)';
  if (e.pageX && e.pageY) {
    const diff = e.clientY - initialClientY.value;
    height.value = props.defaultValue + offsetTop.value + diff;
    height.value = height.value < props.defaultValue ? props.defaultValue : height.value;
    emits('resize');
  }
}, 10);
// 每次拖拽完都记录下上次的差值
const dragEnd = () => {
  offsetTop.value = height.value - props.defaultValue;
  borderColor.value = 'var(--te-border-color-lighter)';
};
// 鼠标移入
const enterHandler = () => {
  borderColor.value = 'var(--te-border-color-dark)';
};
// 鼠标移出
const leaveHandler = () => {
  borderColor.value = 'var(--te-border-color-lighter)';
};
</script>

<style scoped lang="less">
.ber-drag-resize {
  width: 100%;
  background: var(--te-color-white);
  position: relative;
  > .bdr-content {
    height: 100%;
    position: relative;
    width: 100%;
    // overflow: auto;
    border-bottom: 1px solid v-bind(borderColor);
  }
  > .bdr-drag-handler {
    left: 0;
    padding: 5px 0;
    position: absolute;
    bottom: -5px;
    width: 100%;
    z-index: 10;
    cursor: row-resize;
  }
}
</style>
