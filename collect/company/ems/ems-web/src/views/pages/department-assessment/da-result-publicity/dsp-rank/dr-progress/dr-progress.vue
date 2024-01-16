<template>
  <div :class="['dr-progress', isNegative ? 'is-negative' : '']">
    <div class="dp-container">
      <div class="dp-container-bar" :style="{ width: `${progressWidth}` }"></div>
      <span class="dp-container-label" :title="props.value + props.unit">{{ props.value }}{{ props.unit }}</span>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed } from 'vue';
// 组件传参
const props = defineProps({
  value: {
    type: String,
    default: '',
  },
  negativeFlag: {
    type: Boolean,
    default: false,
  },
  width: {
    type: String,
    default: '100%',
  },
  unit: {
    type: String,
    default: '',
  },
});
// 是否是负数
const isNegative = computed(() => {
  return props.negativeFlag;
});
// 宽度
const progressWidth = computed(() => {
  return props.width;
});
</script>
<style lang="less" scoped>
.dr-progress {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;

  &.is-negative {
    justify-content: flex-start;

    .dp-container {
      flex-direction: row-reverse;
      justify-content: flex-start;
      gap: 4px;
    }

    .dp-container-bar {
      height: 12px;
      background-color: var(--te-color-danger);
    }
  }

  .dp-container {
    width: 50%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }

  .dp-container-label {
    max-width: 75px;
    min-width: 75px;
    color: var(--te-text-color-regular);
    font-size: var(--te-font-size-b14);
    line-height: 22px;

    overflow: hidden;
    text-overflow: ellipsis;
  }

  .dp-container-bar {
    display: inline-block;
    height: 12px;
    background-color: var(--te-color-primary);
    animation: progress 288ms linear alternate forwards;

    &.is-negative {
      background-color: var(--te-color-danger);
    }
  }
}
@keyframes progress {
  0% {
    width: 0%;
  }
}
</style>
