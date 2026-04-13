<template>
  <tsm-theme-provider>
    <view class="container">
      <text class="title">Stepper 步进器</text>

      <view class="section">
        <text class="section-title">基础用法</text>
        <view class="button-group">
          <view class="button-group__item">
            <tsm-stepper @input="handleInput" @change="handleChange" v-model="value1"></tsm-stepper>
          </view>
        </view>
      </view>

      <view class="section">
        <text class="section-title">自定义step：2</text>
        <view class="button-group">
          <view class="button-group__item is-flex">
            <tsm-stepper v-model="value2" :step="2"></tsm-stepper>
          </view>
        </view>
      </view>

      <view class="section">
        <text class="section-title">small尺寸</text>
        <view class="button-group">
          <view class="button-group__item">
            <tsm-stepper v-model="value3" :small="true"></tsm-stepper>
          </view>
        </view>
      </view>

      <view class="section">
        <text class="section-title">禁用状态</text>
        <view class="button-group">
          <view class="button-group__item">
            <tsm-stepper v-model="value4" :disabled="true"></tsm-stepper>
          </view>
        </view>
      </view>

      <view class="section">
        <text class="section-title">大小限制</text>
        <view class="button-group">
          <view class="button-group__item">
            <view>限制最小值：3</view>
            <tsm-stepper v-model="value5" :min="3"></tsm-stepper>
          </view>
          <view class="button-group__item">
            <view>限制最大值：99</view>
            <tsm-stepper v-model="value6" :max="99"></tsm-stepper>
          </view>
        </view>
      </view>
    </view>
  </tsm-theme-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const value1 = ref(3);
const value2 = ref(3);
const value3 = ref(3);
const value4 = ref(3);
const value5 = ref(10);
const value6 = ref(10);

const handleInput = (e: any) => {
  console.log('input', e);
};

const handleChange = (e: any) => {
  console.log('change', e);
};
</script>

<style scoped lang="scss">
@import '@/uni_modules/@tiansu/ts-mobile-ui/libs/scss/platform-style.scss';

.container {
  padding: 20px;
}

.title {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 30px;
  text-align: center;
}

.section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #666;
}

.button-group {
  @include tsm-flex-wrap-gap-container(15px);
}

.button-group__item {
  width: 100%;
  @include tsm-flex-wrap-gap-item(15px);
}

.button-group__item.is-flex {
  display: flex;
  align-items: center;
}

.button-group__item .button-group__item-label {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.event-log {
  margin-top: 20px;
  font-size: 20px;
  color: #999;
}
</style>
