<template>
  <tsm-theme-provider>
    <view class="container">
      <view class="section">
        <text class="section-title">搜索框</text>
        <tsm-search
          v-model="inputValue1"
          placeholder="请输入内容1"
          :delay="500"
          shape="round"
          show-filter-btn
          :filter-btn-has-condition="filterBtnHasCondition"
          @search="handleSearch"
          @input="handleInput"
          @confirm="handleConfirm"
          @blur="handleBlur"
          @focus="handleFocus"
          @clear="handleClear"
          @filter-btn-click="handleFilterBtnClick"
        />
      </view>
    </view>
  </tsm-theme-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const inputValue1 = ref('');
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
