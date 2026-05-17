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
const mapComponentClass = () => {
  return ['common-page-container', props.customClass];
};
</script>
<style lang="less" scoped>
.common-page-container {
  width: 100%;
  height: 100%;
  background: #f0f2f5;
  overflow: hidden;
  padding: 16px;

  .pcv-wrap {
    background: #fff;
    height: 100%;
    padding: 20px;
    overflow: auto;
    box-sizing: border-box;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    transition: box-shadow 0.3s ease;

    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }
  }
}
</style>
