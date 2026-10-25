<template>
  <div :class="mapComponentClass()">
    <div class="pcv-wrap">
      <slot></slot>
    </div>
  </div>
</template>
<script lang="ts" setup>
defineOptions({
  name: 'CommonPageContainer',
});
// props
const props = defineProps({
  customClass: {
    type: String,
    default: '',
  },
});
// 组件类名
const mapComponentClass = () => ['common-page-container', props.customClass];
</script>
<style lang="less" scoped>
.common-page-container {
  width: 100%;
  height: 100%;
  min-height: 0;
  background: transparent;
  overflow: hidden;
  padding: 0;

  .pcv-wrap {
    position: relative;
    height: 100%;
    // padding: 18px;
    overflow: auto;
    overflow-x: hidden;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--ai-border);
    border-radius: var(--ai-radius-lg);
    background: var(--ai-surface);
    backdrop-filter: blur(20px);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.05),
      var(--ai-shadow-md);
    transition:
      border-color 0.3s ease,
      box-shadow 0.3s ease;

    &:hover {
      border-color: var(--ai-border-strong);
    }
  }
}
</style>
