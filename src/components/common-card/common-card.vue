<template>
  <div class="common-card">
    <div class="common-card-header">{{ props.title }}</div>
    <div class="common-card-body">
      <slot></slot>
    </div>
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    default: '',
  },
});
</script>
<style lang="less" scoped>
.common-card {
  width: 100%;
  height: auto;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  box-shadow: 0px 0px 0px 2px var(--color-text-divider);

  .common-card-header {
    height: 48px;
    line-height: 48px;
    padding: 0 24px;
    font-size: 24px;
    font-weight: 600;
    background-color: var(--color-table-header);
  }

  .common-card-body {
    flex: auto;
    padding: 16px;
  }
}
</style>
