<!--
 * @Author: yut
 * @Date: 2023-08-10 14:17:35
 * @LastEditors: yut
 * @LastEditTime: 2023-11-09 14:54:23
 * @Descripttion: 
-->
<template>
  <div class="wi-sub-title">
    <span class="wst-icon"><icon-title-decoration /></span>
    <div :title="subTitle">{{ subTitle }}</div>
    <span class="wst-detail" v-if="showDetail" @click="viewDetail" :class="!accessed ? 'not-allowed' : ''">
      查看详情 <icon-right
    /></span>
  </div>
</template>
<script lang="ts" setup>
import { IconTitleDecoration, IconRight } from '@arco-iconbox/vue-te';

const props = defineProps<{
  subTitle: string; //标题
  showDetail?: boolean; //是否展示查看详情
  accessed?: boolean;
}>();
const emit = defineEmits(['viewDetail']);

const viewDetail = () => {
  emit('viewDetail');
};
</script>
<style lang="less" scoped>
.wi-sub-title {
  display: flex;
  align-items: center;
  gap: var(--te-space-4);
  margin-bottom: var(--te-space-16);
  > div {
    height: 24px;
    line-height: 24px;
    font-weight: 500;
    flex: auto;
    font-size: var(--te-font-size-h16);
    color: var(--te-text-color-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .wst-icon {
    color: rgb(47, 155, 255);
    width: 16px;
    height: 16px;
    flex: none;
    font-size: var(--te-font-size-h16);
  }
  .wst-detail {
    flex: none;
    display: flex;
    align-items: center;
    cursor: pointer;
    color: var(--te-color-primary);
    font-size: var(--te-font-size-b14);
    &.not-allowed {
      cursor: not-allowed;
      color: var(--te-color-primary-light-5);
    }
  }
}
</style>
