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
    /* 原 overflow-x: hidden 会把超宽内容（表格/长代码）直接裁掉且无法横向滚动，
     * 这里交给 overflow:auto 统一处理，避免「纵向滚动 + 横向裁剪」的混合行为。 */
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--ai-border);
    border-radius: var(--ai-radius-md);
    background: var(--ai-surface);
    backdrop-filter: blur(20px);
    box-shadow:
      var(--ai-ring),
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
