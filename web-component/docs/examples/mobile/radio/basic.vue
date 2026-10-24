<template>
  <view>
    <tem-cell titleText="默认样式" layout="vertical" showContent>
      <template #content>
        <view class="uni-list">
          <tem-radio-group :vertical="true" @change="radioChange">
            <tem-radio
              v-for="(item, index) in items"
              :key="item.value"
              :value="item.value"
              :checked="index === current"
              >{{ item.name }}</tem-radio
            >
          </tem-radio-group>
        </view>
      </template>
    </tem-cell>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
// import {
//   TemRadio,
//   TemRadioGroup,
//   TemCell,
// } from '@zpackage/mobile-package';
const items = [
  {
    value: 'USA',
    name: '美国',
    checked: 'true',
  },
  {
    value: 'CHN',
    name: '中国',
  },
  {
    value: 'BRA',
    name: '巴西',
  },
  {
    value: 'JPN',
    name: '日本',
  },
  {
    value: 'ENG',
    name: '英国',
  },
  {
    value: 'FRA',
    name: '法国',
  },
];
const current = ref(0);

const radioChange = (evt) => {
  for (let i = 0; i < items.length; i++) {
    if (items[i].value === evt.detail.value) {
      current.value = i;
      break;
    }
  }
};
</script>

<style lang="scss"></style>
