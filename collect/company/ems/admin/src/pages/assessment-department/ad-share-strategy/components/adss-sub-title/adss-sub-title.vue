<template>
  <div class="adss-sub-title flex-row-justify-center">
    <span class="title">{{ props.title }}</span>
    <slot></slot>
  </div>
</template>
<script lang="ts" setup>
const props = defineProps({
  title: {
    type: String,
    default: '',
  },
});
</script>
<style lang="less" scoped>
.adss-sub-title {
  position: relative;
  padding-left: 20px;
  line-height: 23px;
  margin: 16px 0;

  .title {
    color: var(--te-text-color-primary);
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
  }

  &::before {
    content: '';
    width: 16px;
    height: 16px;
    background-image: url('../../../../../assets/img/common/common-title-decoration.svg');
    background-repeat: no-repeat;
    background-size: cover;
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
  }
}
</style>
