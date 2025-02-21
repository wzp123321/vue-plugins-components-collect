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
  background: #f5f6f8;
  overflow: hidden;
  padding: 20px;

  .pcv-wrap {
    background: #fff;
    height: 100%;
    padding: 20px;
    overflow: auto;
    box-sizing: border-box;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
  }
}
</style>
