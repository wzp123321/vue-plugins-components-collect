<!-- 本示例未包含完整css，获取外链css请参考上文，在hello uni-app项目中查看 -->
<template>
  <view>
    <view class="uni-padding-wrap uni-common-mt">
      <view class="uni-title uni-common-mt">默认样式</view>
      <view>
        <tem-checkbox-group :vertical="false">
          <tem-checkbox value="cb" checked="true">选中</tem-checkbox>
          <tem-checkbox value="cb">未选中 </tem-checkbox>
        </tem-checkbox-group>
      </view>
    </view>

    <view class="uni-padding-wrap">
      <view class="uni-title uni-common-mt"> 列表样式 </view>
    </view>
    <view class="uni-list">
      <tem-checkbox-group @change="checkboxChange">
        <tem-checkbox
          v-for="item in items"
          :key="item.value"
          :value="item.value"
          :checked="item.checked"
        >
          {{ item.name }}
        </tem-checkbox>
      </tem-checkbox-group>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
// import {
//   TemCheckboxGroup,
//   TemCheckbox,
// } from '@tiansu/ts-mobile-package';

const items = ref([
  {
    value: 'USA',
    name: '美国',
    checked: false,
  },
  {
    value: 'CHN',
    name: '中国',
    checked: true,
  },
  {
    value: 'BRA',
    name: '巴西',
    checked: false,
  },
  {
    value: 'JPN',
    name: '日本',
    checked: false,
  },
  {
    value: 'ENG',
    name: '英国',
    checked: false,
  },
  {
    value: 'FRA',
    name: '法国',
    checked: false,
  },
]);
const checkboxChange = (e) => {
  const values = e.detail.value;
  for (var i = 0, lenI = items.value.length; i < lenI; ++i) {
    const item = items.value[i];
    if (values.includes(item.value)) {
      item.checked = true;
    } else {
      item.checked = false;
    }
  }
};
</script>

<style lang="scss"></style>
