<template>
  <div class="alarm-sub-title">
    <span class="alarm-sub-title-label">{{ props.title }}</span>
    <slot></slot>
  </div>
</template>
<script lang="ts" setup>
defineOptions({
  name: 'TeAlarmSubTitle',
});

const props = withDefaults(
  defineProps<{
    title: string;
  }>(),
  {
    title: '',
  },
);
</script>
<style lang="less" scoped>
.alarm-sub-title {
  position: relative;
  padding-left: var(--te-space-20);
  display: flex;
  justify-content: space-between;
  align-items: center;

  > .alarm-sub-title-label {
    color: var(--te-text-color-primary);
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
  }

  &::before {
    content: '';
    width: 16px;
    height: 16px;
    background: url('../assets/alarm-affix-title-decoration.png');
    background-repeat: no-repeat;
    background-size: 100% 100%;
    background-position: center center;
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
  }
}
</style>
