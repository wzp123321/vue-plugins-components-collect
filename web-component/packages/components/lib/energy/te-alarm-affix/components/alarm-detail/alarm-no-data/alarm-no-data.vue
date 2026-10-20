<template>
  <div class="alarm-no-data">
    <img src="../../../assets/alarm-affix-no-data.svg" alt="ico" />
    <span>
      {{ props.title }}
    </span>
  </div>
</template>
<script lang="ts" setup>
import { defineComponent } from 'vue';

defineComponent({
  name: 'AlarmNoData',
});

const props = defineProps({
  title: {
    type: String,
    default: '暂无数据',
  },
});
</script>
<style lang="less" scoped>
.alarm-no-data {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  > img {
    width: 200px;
    height: 200px;
  }

  span {
    color: var(--te-text-color-secondary);
    margin-top: 16px;
    font-size: 14px;
  }
}
</style>
