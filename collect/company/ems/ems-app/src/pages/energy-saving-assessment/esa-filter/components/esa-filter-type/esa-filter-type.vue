<!--
 * @Author: yut
 * @Date: 2023-11-01 09:53:53
 * @LastEditors: yut
 * @LastEditTime: 2023-11-17 15:01:43
 * @Descripttion: 
-->
<template>
  <view class="esa-filter-type">
    <view
      :class="item.code === selectCode ? 'eft-active' : ''"
      v-for="(item, index) in typeList"
      :key="item.code"
      @click="selectTypeCode(item.code)"
    >
      {{ item.name }}
    </view>
  </view>
</template>
<script lang="ts" setup>
import type { Common_ICodeName } from '@/api/model';
import type { PropType } from 'vue';

const props = defineProps({
  typeList: {
    type: Array as PropType<Common_ICodeName<string>[]>,
    default: () => [],
  },
  selectCode: {
    type: String,
    default: '',
  },
});
const emits = defineEmits(['select']);

const selectTypeCode = (code: string) => {
  emits('select', code);
};
</script>
<style lang="scss" scoped>
.esa-filter-type {
  padding: 0 16px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  grid-auto-rows: minmax(48px, auto);
  gap: 8px;
  margin-bottom: 16px;
  > uni-view {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    font-size: var(--tem-font-size-b14);
    color: var(--tem-text-color-regular);
    background-color: var(--tem-fill-color);
  }
  .eft-active {
    background-color: var(--tem-color-primary-light-9);
    color: var(--tem-color-primary);
  }
}
</style>
