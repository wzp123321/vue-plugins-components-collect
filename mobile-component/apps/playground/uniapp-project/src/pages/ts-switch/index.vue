<template>
  <tsm-theme-provider>
    <view class="container">
      <text class="title">Switch 开关组件</text>

      <view class="section">
        <text class="section-title">基础用法</text>
        <view class="button-group">
          <view class="button-group__item">
            <tsm-switch v-model:checked="value1"></tsm-switch>
          </view>
        </view>
      </view>
      <view class="section">
        <text class="section-title">自定义尺寸</text>
        <view class="button-group">
          <view class="button-group__item">
            <tsm-switch size="large" v-model:checked="value2"></tsm-switch>
          </view>
          <view class="button-group__item">
            <tsm-switch size="medium" v-model:checked="value3"></tsm-switch>
          </view>
          <view class="button-group__item">
            <tsm-switch size="small" v-model:checked="value4"></tsm-switch>
          </view>
        </view>
      </view>
      <view class="section">
        <text class="section-title">自定义颜色</text>
        <view class="button-group">
          <view class="button-group__item">
            <tsm-switch inactive-color="red" active-color="green" v-model:checked="value5"></tsm-switch>
          </view>
        </view>
      </view>
      <view class="section">
        <text class="section-title">显示文字</text>
        <view class="button-group">
          <view class="button-group__item">
            <tsm-switch :inactive-text="true" v-model:checked="value6"></tsm-switch>
            <tsm-switch
              :inactive-text="true"
              checked-text="测试"
              un-checked-text="继续测试"
              v-model:checked="value7"
            ></tsm-switch>
          </view>
        </view>
      </view>
      <view class="section">
        <text class="section-title">禁用状态</text>
        <view class="button-group">
          <view class="button-group__item">
            <tsm-switch disabled></tsm-switch>
          </view>
        </view>
      </view>
    </view>
  </tsm-theme-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const value1 = ref(true);
const value2 = ref(true);
const value3 = ref(true);
const value4 = ref(true);
const value5 = ref(true);
const value6 = ref(true);
const value7 = ref(true);
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
