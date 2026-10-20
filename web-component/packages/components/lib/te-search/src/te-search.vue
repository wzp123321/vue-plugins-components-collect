<template>
  <te-input v-bind="$attrs" @input="valueInput">
    <template #prefix>
      <te-icon><icon-search /></te-icon>
    </template>
    <!-- 通过遍历实现插槽透传 -->
    <template v-for="(item, key, index) in $slots" :key="index" v-slot:[key]>
      <slot :name="key"></slot>
    </template>
  </te-input>
</template>
<script lang="ts" setup name="TeSearch">
import { TeInput, TeIcon } from '@tiansu/element-plus';
import { IconSearch } from '@arco-iconbox/vue-te';

/**
 * 防抖函数
 * @param func 执行函数
 * @param delay 延迟时间 ms
 * @param immediate 是否立即执行
 */
const debounce = (func: any, time: number, immediate = false) => {
  let timer: number | null = null;
  return (...args: any[]) => {
    if (timer) clearInterval(timer);
    if (immediate) {
      if (!timer) func.apply(this, args);
      timer = window.setTimeout(() => {
        timer = null;
      }, time);
    } else {
      timer = window.setTimeout(() => {
        func.apply(this, args);
      }, time);
    }
  };
};

interface Props {
  duringTime?: number;
}
const props = withDefaults(defineProps<Props>(), {
  duringTime: 500,
});

const emit = defineEmits(['input']);
const valueInput = debounce((value: any) => {
  emit('input', value);
}, props.duringTime);
</script>
<style scoped>
/* @import '@tiansu/ts-web-package/dist/styles/index.css'; */
</style>
