<template>
  <tsm-theme-provider>
    <view class="container">
      <!-- 基本搜索框 -->
      <view class="section">
        <text class="section-title">基本搜索框</text>
        <tsm-search
          v-model="inputValue1"
          placeholder="请输入搜索关键词"
          @search="handleSearch"
          @input="handleInput"
          @confirm="handleConfirm"
          @blur="handleBlur"
          @focus="handleFocus"
          @clear="handleClear"
        />
      </view>

      <!-- 圆角搜索框 -->
      <view class="section">
        <text class="section-title">圆角搜索框</text>
        <tsm-search v-model="inputValue2" placeholder="圆角搜索" shape="round" @search="handleSearch" />
      </view>

      <!-- 白色背景搜索框 -->
      <view class="section">
        <text class="section-title">白色背景搜索框</text>
        <tsm-search
          v-model="inputValue3"
          placeholder="白色背景"
          bg-color="white"
          shape="round"
          @search="handleSearch"
        />
      </view>

      <!-- 禁用状态 -->
      <view class="section">
        <text class="section-title">禁用状态</text>
        <tsm-search v-model="inputValue4" placeholder="禁用状态" :disabled="true" />
      </view>

      <!-- 不带清除按钮 -->
      <view class="section">
        <text class="section-title">不带清除按钮</text>
        <tsm-search v-model="inputValue5" placeholder="无清除按钮" :clearable="false" @search="handleSearch" />
      </view>

      <!-- 带延迟的搜索 -->
      <view class="section">
        <text class="section-title">带延迟的搜索(500ms)</text>
        <tsm-search v-model="inputValue6" placeholder="输入后延迟搜索" :delay="500" @search="handleSearch" />
      </view>

      <!-- 显示筛选按钮 -->
      <view class="section">
        <text class="section-title">显示筛选按钮</text>
        <tsm-search
          v-model="inputValue7"
          placeholder="带筛选按钮"
          show-filter-btn
          :filter-btn-has-condition="filterBtnHasCondition"
          @search="handleSearch"
          @filter-btn-click="handleFilterBtnClick"
        />
        <text class="tip">点击筛选按钮，模拟设置查询条件以达到切换筛选按钮状态</text>
      </view>
      <!-- 小号搜索框 -->
      <view class="section">
        <text class="section-title">小号搜索框</text>
        <tsm-search v-model="inputValue7" placeholder="小号搜索" size="small" @search="handleSearch" />
      </view>
    </view>
  </tsm-theme-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const inputValue1 = ref('');
const inputValue2 = ref('');
const inputValue3 = ref('');
const inputValue4 = ref('');
const inputValue5 = ref('');
const inputValue6 = ref('');
const inputValue7 = ref('');
const filterBtnHasCondition = ref(false);

const handleInput = (event: any) => {
  console.log(event.detail.value, 'outer');
};

const handleSearch = (value: string) => {
  console.log(value, 'search');
};

const handleConfirm = (event: any) => {
  alert(event.detail.value);
  console.log(event.detail.value, 'confirm');
};

const handleBlur = (event: any) => {
  console.log(event.detail.value, 'blur');
};

const handleFocus = (event: any) => {
  console.log(event.detail.value, 'focus');
};

const handleClear = () => {
  console.log('clear');
};

const handleFilterBtnClick = () => {
  console.log('filterBtnClick');
  filterBtnHasCondition.value = !filterBtnHasCondition.value;
};
</script>

<style scoped lang="scss">
@import '@/uni_modules/@tiansu/ts-mobile-ui/libs/scss/platform-style.scss';
.container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.section {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  margin-bottom: 16px;
  display: block;
}

.tip {
  font-size: 12px;
  color: #8a8f99;
  margin-top: 12px;
  display: block;
}

.input-demo {
  width: 100%;
}

.input-icon {
  width: 20px;
  height: 20px;
}

.suffix-button {
  padding: 0 12px;
  height: 24px;
  background-color: transparent;
  color: #444ce7;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 4px;
}
</style>
