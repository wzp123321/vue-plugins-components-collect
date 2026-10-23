<template>
  <view class="container">
    <tem-side-bar :navList="navList" class="side-bar">
      <template #content="list">
        <view v-for="item in list" :key="item.label">
          <view v-if="item.isActive">
            <tem-checkbox-group checkPositionRight>
              <tem-checkbox :value="item.id" :key="item.id">
                {{ item.name }}
              </tem-checkbox>
            </tem-checkbox-group>
          </view>
        </view>
      </template>
    </tem-side-bar>
  </view>
</template>

<script setup lang="ts">
// import {
//   TemSideBar,
//   TemCheckboxGroup,
//   TemCheckbox,
// } from '@zpackage/mobile-package';

const navList = [
  {
    label: '分类一',
    isActive: true,
    isDisabled: false,
    toDivId: 'position1',
    name: '选项一',
    badge: {
      text: '5',
      type: 'danger',
      size: 'small',
      displayMode: 'bubble',
      offset: [-12, -18],
    },
  },
  {
    label: '分类二',
    isActive: true,
    isDisabled: false,
    toDivId: 'position2',
    name: '选项二',
    badge: {
      text: '5',
      type: 'danger',
      size: 'small',
      displayMode: 'bubble',
      offset: [-12, -18],
    },
  },
  {
    label: '分类三',
    isActive: true,
    isDisabled: false,
    toDivId: 'position1',
    name: '选项三',
    badge: {
      text: '5',
      type: 'danger',
      size: 'small',
      displayMode: 'bubble',
      offset: [-12, -18],
    },
  },
  {
    label: '分类四',
    isActive: true,
    isDisabled: false,
    toDivId: 'position2',
    name: '选项四',
    badge: {
      text: '5',
      type: 'danger',
      size: 'small',
      displayMode: 'bubble',
      offset: [-12, -18],
    },
  },
];
</script>
