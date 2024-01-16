<template>
  <div class="sub-title">
    <span class="title">{{ title }}</span>
    <slot></slot>
  </div>
</template>
<script lang="ts" setup>
import { computed } from 'vue';
const props = defineProps({
  title: {
    type: String,
    default: '',
  },
});
const title = computed(() => {
  return props.title;
});
</script>
<style lang="less" scoped>
.sub-title {
  position: relative;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  padding-left: 16px;
  line-height: 22px;

  .title {
    font-size: 14px;
    color: var(--te-text-color-primary);
    color: #000;
    line-height: 22px;
    font-weight: 700;
  }

  &::before {
    content: '';
    width: 4px;
    height: 16px;
    background-color: var(--te-color-primary);
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
  }
}
</style>
