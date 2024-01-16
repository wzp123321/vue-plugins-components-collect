<template>
  <div class="da-sub-title">
    <span class="dst-sort">{{ props.sort }}</span>
    <span class="dst-title">{{ props.title }}</span>
  </div>
</template>
<script lang="ts" setup>
// 组件传参
const props = defineProps({
  sort: {
    type: Number,
    default: 0,
  },
  title: {
    type: String,
    default: '',
  },
});
</script>
<style lang="less" scoped>
.da-sub-title {
  display: flex;
  align-items: center;
  gap: 8px;

  > span.dst-sort {
    width: 24px;
    height: 24px;
    line-height: 24px;
    font-size: var(--te-font-size-b12);
    border-radius: 4px;
    text-align: center;
    border: 1px solid var(--te-color-primary);
    box-sizing: border-box;
    background: var(--te-color-primary);
    color: var(--te-bg-color);
  }

  > span.dst-title {
    color: var(--te-text-color-primary);
    font-family: PingFang SC;
    font-weight: 600;
    font-size: var(--te-font-size-h20);
    line-height: 28px;
  }
}
</style>
