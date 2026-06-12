<template>
  <tsm-theme-provider>
    <view class="container">
      <view class="header">
        <text class="title">Switch 开关组件</text>
      </view>

      <view class="demo-card">
        <text class="section-title">基础用法</text>
        <view class="demo-grid">
          <view class="demo-item">
            <tsm-switch v-model:checked="value1" @change="handleChange"></tsm-switch>
            <text class="demo-item__label">基础</text>
          </view>
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">自定义尺寸</text>
        <view class="demo-grid">
          <view class="demo-item">
            <tsm-switch size="large" v-model:checked="value2"></tsm-switch>
            <text class="demo-item__label">large</text>
          </view>
          <view class="demo-item">
            <tsm-switch size="medium" v-model:checked="value3"></tsm-switch>
            <text class="demo-item__label">medium</text>
          </view>
          <view class="demo-item">
            <tsm-switch size="small" v-model:checked="value4"></tsm-switch>
            <text class="demo-item__label">small</text>
          </view>
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">自定义颜色</text>
        <view class="demo-grid">
          <view class="demo-item">
            <tsm-switch inactive-color="red" active-color="green" v-model:checked="value5"></tsm-switch>
            <text class="demo-item__label">red/green</text>
          </view>
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">拓展的 value 类型</text>
        <view class="demo-grid demo-grid--wide">
          <view class="demo-item demo-item--wide">
            <text class="demo-item__hint">当前值：{{ value6 }}</text>
            <tsm-switch :inactive-value="100" :active-value="50" v-model:checked="value6"></tsm-switch>
          </view>
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">显示文字</text>
        <view class="demo-grid">
          <view class="demo-item">
            <tsm-switch :inactive-text="true" v-model:checked="value7"></tsm-switch>
            <text class="demo-item__label">inactiveText</text>
          </view>
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">禁用状态</text>
        <view class="demo-grid">
          <view class="demo-item">
            <tsm-switch disabled></tsm-switch>
            <text class="demo-item__label">disabled</text>
          </view>
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">只读模式</text>
        <view class="demo-grid">
          <tsm-switch v-model:checked="value8" :readonly="true"></tsm-switch>
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
const value5 = ref(false);
const value6 = ref<number | boolean | string>(50);
const value7 = ref(true);
const value8 = ref(true);
const value9 = ref(false);

const handleChange = (val: boolean) => {
  console.log('change', val);
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

.demo-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 12px;
}

.demo-grid--wide {
  gap: 8px 10px;
}

.demo-item {
  width: 104px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.demo-item--wide {
  width: 100%;
  align-items: flex-start;
}

.demo-item__label {
  margin-top: 6px;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.2;
}

.demo-item__hint {
  margin-bottom: 8px;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.2;
}
</style>
