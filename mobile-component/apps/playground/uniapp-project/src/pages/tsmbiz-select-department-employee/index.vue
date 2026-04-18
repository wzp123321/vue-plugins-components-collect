<template>
  <tsm-theme-provider>
    <view class="container">
      <view class="header">
        <text class="title">tsm-select-department-employee 测试</text>
      </view>

      <view class="content">
        <!-- 测试基本用法 -->
        <view class="section">
          <text class="section-title">基本用法</text>
          <tsmbiz-select-department-employee
            ref="selectRef"
            title="选择部门/员工"
            v-model:show="show"
            @confirm="onConfirm"
          />
          <button @click="showSelect" class="btn">打开选择器</button>
        </view>

        <!-- 测试已选值 -->
        <view class="section">
          <text class="section-title">已选值</text>
          <text v-if="selectedData" class="selected-text"> 已选择: {{ JSON.stringify(selectedData) }} </text>
          <text v-else class="selected-text">未选择任何数据</text>
        </view>
      </view>
    </view>
  </tsm-theme-provider>
</template>

<script setup>
import { ref } from 'vue';

const selectRef = ref(null);
const show = ref(false);
const selectedData = ref(null);

const showSelect = () => {
  show.value = true;
};

const onConfirm = data => {
  selectedData.value = data;
  show.value = false;
  console.log('选择结果:', data);
};
</script>

<style scoped>
.container {
  padding: 20rpx;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  margin-bottom: 30rpx;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.content {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
}

.section {
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #666;
  margin-bottom: 20rpx;
}

.btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  background-color: #1890ff;
  color: #fff;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.selected-text {
  font-size: 24rpx;
  color: #666;
  line-height: 40rpx;
  white-space: pre-wrap;
}
</style>
