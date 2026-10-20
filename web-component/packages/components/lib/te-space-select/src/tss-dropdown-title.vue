<template>
  <div class="tss-dropdown-title">{{ props.title }}</div>
</template>
<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title: string; //标题
  }>(),
  {}
);
</script>
<style scoped lang="less">
.tss-dropdown-title {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 99999;
  background: var(--te-fill-color-blank);
  width: 100%;
  line-height: 22px;
  font-size: var(--te-font-size-b14);
  color: var(--te-text-color-primary);
  display: flex;
  flex-direction: row;
  padding: 8px 0 8px 16px;
}
</style>
