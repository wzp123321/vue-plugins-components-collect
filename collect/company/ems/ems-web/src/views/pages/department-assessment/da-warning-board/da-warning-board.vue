<template>
  <div class="da-warning-board">
    <icon-warning-filled :width="16" :height="22" />
    <p>请完成以下3项科室考核配置，配置完成后将根据选择自动统计数据，以便跟踪能耗用量及科室考核结果</p>
  </div>
</template>
<script lang="ts" setup>
// 组件
import { IconWarningFilled } from '@arco-iconbox/vue-te';
</script>
<style lang="less" scoped>
.da-warning-board {
  width: 100%;
  border-radius: 4px;
  background: var(--te-color-warning-light-9);
  padding: 8px 16px;
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  transition: all 233ms;

  > svg {
    fill: var(--te-color-warning);
  }

  > p {
    color: var(--te-color-warning);
    font-size: var(--te-font-size-b14);
    line-height: 22px;
    margin-left: 8px;
  }
}
</style>
