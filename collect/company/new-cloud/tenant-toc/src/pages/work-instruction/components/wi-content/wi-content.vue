<!--
 * @Author: yut
 * @Date: 2023-09-13 15:25:01
 * @LastEditors: yut
 * @LastEditTime: 2023-11-09 10:46:11
 * @Descripttion: 
-->
<template>
  <div class="wi-content">
    <wi-card
      v-for="(item, index) in wiContentList"
      :sub-title="item.showName"
      :description="item.description"
      :img="item.img!"
      :show-tag="item.showTag"
      :path="item.url"
      :id="item.id"
      :index="index + 1"
      :accessed="item.accessed"
    ></wi-card>
  </div>
</template>
<script lang="ts" setup>
import { WI_IMenuItem } from '../../work-instruction.api';
import { WiCard } from '../index';

const props = defineProps<{
  wiContentList?: WI_IMenuItem[];
}>();
</script>
<style lang="less" scoped>
.wi-content {
  width: 100%;
  height: 100%;
  display: flex;
  .wi-card:first-child {
    padding-left: 0 !important;
  }
  .wi-card:last-child {
    padding-right: 0 !important;
    &::after {
      display: none;
    }
  }
}
</style>
