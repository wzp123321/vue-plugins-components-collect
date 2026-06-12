<template>
  <tsm-theme-provider>
    <view class="container">
      <view class="header">
        <text class="title">Stepper 步进器</text>
      </view>

      <view class="demo-card">
        <text class="section-title">基础用法</text>
        <view class="button-group">
          <view class="button-group__item">
            <tsm-stepper @input="handleInput" @change="handleChange" v-model="value1"></tsm-stepper>
          </view>
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">自定义 step：2</text>
        <view class="button-group">
          <view class="button-group__item is-flex">
            <tsm-stepper v-model="value2" :step="2"></tsm-stepper>
          </view>
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">small 尺寸</text>
        <view class="button-group">
          <view class="button-group__item">
            <tsm-stepper v-model="value3" :small="true"></tsm-stepper>
          </view>
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">禁用状态</text>
        <view class="button-group">
          <view class="button-group__item">
            <tsm-stepper v-model="value4" :disabled="true"></tsm-stepper>
          </view>
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">只读模式</text>
        <view class="button-group">
          <view class="button-group__item">
            <view>readonly（value：{{ value7 }}）</view>
            <tsm-stepper v-model="value7" :readonly="true"></tsm-stepper>
          </view>
        </view>
      </view>

      <view class="demo-card">
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
const value7 = ref(12);
const value8 = ref(6);

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
  padding: 12px;
  background: #f7f8fa;
  height: 100%;
  box-sizing: border-box;
}

.header {
  padding: 10px 10px 4px;
  margin-bottom: 10px;
}

.title {
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  color: #111827;
  line-height: 1.2;
}

.demo-card {
  background: #ffffff;
  border: 1px solid #eef2f7;
  border-radius: 12px;
  padding: 14px 12px 12px;
  margin-bottom: 10px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #111827;
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
  margin-top: 10px;
  font-size: 14px;
  color: #6b7280;
}
</style>
