<template>
  <tem-cell titleText="基础用法" layout="vertical" showContent>
    <template #content>
      <view class="row">
        <tem-icon v-for="item in names" :key="item" :name="item" />
      </view>
    </template>
  </tem-cell>
  <tem-cell titleText="样式修改" layout="vertical" showContent>
    <template #content>
      <view class="row">
        <tem-icon
          v-for="item in names"
          :key="item"
          :name="item"
          color="red"
          size="38"
        />
      </view>
    </template>
  </tem-cell>
</template>

<script setup lang="ts">
// import { TemIcon, TemCell } from '@tiansu/ts-mobile-package';
const names = ['checkbox_indeterminate', 'avatar', 'circle_close_fill'];
</script>

<style lang="scss"></style>
