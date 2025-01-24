<!--
 * @Author: wanzp
 * @Date: 2022-08-20 20:44:44
 * @LastEditors: wanzp wanzp@tiansu-china.com
 * @LastEditTime: 2025-01-24 15:13:11
 * @Description: 
-->
<template>
  <div class="if-text-filter">
    <a-divider>文本过滤</a-divider>
    <div class="mb16 flex">
      <a-input :maxlength="1" type="text" v-model="textFilter.symbolValue" />
      <a-button class="ml12" @click="textFilter.addSymbol()">添加特殊符号</a-button>
    </div>
    <div class="if-text-filter-symbol flex mt16 mb16">
      <span v-for="(item, index) in textFilter.symbols" :key="'symbol' + index">{{ item }}</span>
    </div>
    <a-input type="text" v-model="textFilter.value" @input="textFilter.input($event)" />
  </div>
</template>
<script lang="ts" setup>
import TextFilterService from './if-text-filter.service';

const textFilter = new TextFilterService();
</script>
<style lang="less" scoped>
.if-text-filter {
  &-symbol {
    span {
      display: inline-block;
      line-height: 32px;
      height: 32px;

      padding: 0 16px;
      margin-right: 16px;

      border: 1px solid var(--color-text-border);
      border-radius: 4px;
    }
  }

  h5 {
    font-size: 18px;
    color: var(--color-text-primary);
  }
}
</style>
