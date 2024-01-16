<!--
 * @Author: yut
 * @Date: 2023-08-09 11:02:35
 * @LastEditors: yut
 * @LastEditTime: 2023-11-09 16:34:16
 * @Descripttion: 
-->
<template>
  <div
    :class="['wi-bar', !accessed ? 'not-allowed' : '']"
    @click="wiService.onLinkTo(path, flag, id.toString(), accessed, subTitle)"
  >
    <span class="wi-bar-index">{{ index }}</span>
    <div class="wi-bar-name">{{ subTitle }}</div>
    <span class="wi-bar-icon"><icon-right /></span>
  </div>
</template>
<script lang="ts" setup>
import wiService from '../../work-instruction.service';
import { IconRight } from '@arco-iconbox/vue-te';

const props = defineProps<{
  index: number | string; //序号
  subTitle: string; //子标题
  path: string; //url地址
  id: number; //唯一标识
  flag: number;
  accessed: boolean;
}>();
</script>
<style lang="less" scoped>
.wi-bar {
  width: 100%;
  height: 64px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  padding: 0 var(--te-space-12);
  gap: var(--te-space-12);
  border: 1px solid var(--te-border-color-light);
  &:hover {
    background-color: var(--te-fill-color-light);
    cursor: pointer;
  }

  &-index,
  &-icon {
    display: inline-flex;
    width: 32px;
    height: 32px;
    flex: none;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  &-name {
    flex: auto;
    width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 600;
    font-size: var(--te-font-size-b14);
    color: var(--te-text-color-regular);
  }
  &-index {
    border-radius: 4px;
    background: var(--te-fill-color);
    font-family: var(--te-font-family-d-din);
    color: var(--te-text-color-disabled);
  }
  &.not-allowed {
    cursor: not-allowed;
    border-color: var(--te-disabled-border-color);
    &:hover {
      background-color: transparent;
    }
    .wi-bar-name,
    .wi-bar-icon {
      color: var(--te-text-color-secondary);
    }
  }
}
</style>
