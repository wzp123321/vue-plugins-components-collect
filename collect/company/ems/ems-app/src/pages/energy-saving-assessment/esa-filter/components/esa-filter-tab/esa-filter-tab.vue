<!--
 * @Author: yut
 * @Date: 2023-11-01 13:59:51
 * @LastEditors: yut
 * @LastEditTime: 2023-11-17 15:01:07
 * @Descripttion: 
-->
<template>
  <view class="esa-filter-tab">
    <view
      :class="selectCode === item.code ? 'eft-active' : ''"
      v-for="item in treeTypeList"
      :key="item.code"
      @click="selectTreeCode(item.code)"
    >
      <text>{{ item.name }}</text>
    </view>
  </view>
</template>
<script lang="ts" setup>
import type { Common_ICodeName } from '@/api/model';
const props = defineProps<{
  treeTypeList: Common_ICodeName<string>[];
  selectCode: string;
}>();

const emits = defineEmits(['select']);

const selectTreeCode = (code: string) => {
  emits('select', code);
};
</script>
<style lang="scss" scoped>
.esa-filter-tab {
  height: 40px;
  flex: none;
  display: flex;
  > view {
    flex: 1;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--tem-text-color-regular);
    font-size: var(--tem-font-size-b14);
  }
  .eft-active {
    color: var(--tem-color-primary);
    font-weight: 600;
    position: relative;
    &::after {
      content: '';
      width: 16px;
      height: 3px;
      border-radius: 999px;
      background: var(--tem-color-primary);

      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      transition: none;
    }
  }
}
</style>
