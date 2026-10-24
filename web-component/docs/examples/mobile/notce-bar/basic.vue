<template>
  <view>
    <view>
      <tem-cell titleText="默认样式" layout="vertical" showContent>
        <template #content>
          <view class="row">
            <tem-switch checked @change="switch1Change" />
            <tem-switch @change="switch2Change" />
          </view>
        </template>
      </tem-cell>

      <tem-cell titleText="不同尺寸的switch" layout="vertical" showContent>
        <template #content>
          <view class="row">
            <tem-switch
              v-for="item in ['large', 'medium', 'small']"
              checked
              :size="item"
            />
          </view>
        </template>
      </tem-cell>
      <tem-cell titleText="自定义样式的switch" layout="vertical" showContent>
        <template #content>
          <view class="row">
            <tem-switch
              checked
              :size="'large'"
              activeColor="var(--tem-color-danger)"
              inactiveColor="var(--tem-color-success)"
              activeText="开"
              inactiveText="关"
            />
          </view>
        </template>
      </tem-cell>
    </view>
  </view>
</template>

<script setup lang="ts">
// import { TemSwitch, TemCell } from '@zpackage/mobile-package';

const switch1Change = (e) => {
  console.log('switch1 发生 change 事件，携带值为', e.detail.value);
};
const switch2Change = (e) => {
  console.log('switch2 发生 change 事件，携带值为', e.detail.value);
};
</script>

<style lang="scss">
.row {
  display: flex;
  gap: var(--tem-spacing-l);
  flex-wrap: wrap;
}
</style>
