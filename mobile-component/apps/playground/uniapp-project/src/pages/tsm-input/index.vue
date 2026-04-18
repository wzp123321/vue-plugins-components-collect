<template>
  <tsm-theme-provider>
    <view class="container">
      <view class="section">
        <text class="section-title">基础输入框</text>
        <tsm-input
          v-model.trim="inputValue1"
          placeholder="请输入内容1"
          class="input-demo"
          @input="handleInput"
          @confirm="handleConfirm"
        />
      </view>
      <view class="section">
        <text class="section-title">带前缀图标的输入框</text>
        <tsm-input v-model="inputValue2" placeholder="请输入内容" class="input-demo">
          <template #prefix>
            <icon-cube-three />
          </template>
        </tsm-input>
      </view>

      <view class="section">
        <text class="section-title">带字数限制的输入框</text>
        <tsm-input v-model="inputValue3" placeholder="请输入内容" :maxlength="20" showWordimit class="input-demo" />
      </view>

      <view class="section">
        <text class="section-title">带清除按钮的输入框</text>
        <tsm-input v-model="inputValue4" placeholder="请输入内容" clearable class="input-demo" />
      </view>

      <view class="section">
        <text class="section-title">带后缀按钮的输入框</text>
        <tsm-input v-model="inputValue5" placeholder="请输入手机号" class="input-demo">
          <template #suffix>
            <view>获取验证码</view>
          </template>
        </tsm-input>
      </view>
      <view class="section">
        <text class="section-title">数字输入框</text>
        <tsm-input v-model="inputValue6" placeholder="请输入数字" type="number" clearable class="input-demo" />
      </view>

      <view class="section">
        <text class="section-title">带提示信息的输入框</text>
        <tsm-input
          v-model="inputValue7"
          placeholder="请输入内容"
          tips="这是一段提示内容"
          clearable
          :maxlength="20"
          showWordimit
          class="input-demo"
        >
          <template #prefix>
            <icon-cube-three />
          </template>
          <template #suffix>
            <view>获取验证码</view>
          </template>
        </tsm-input>
      </view>

      <view class="section">
        <text class="section-title">禁用的输入框</text>
        <tsm-input
          v-model="inputValue8"
          placeholder="请输入内容"
          tips="这是一段提示内容"
          clearable
          :maxlength="20"
          showWordimit
          class="input-demo"
          disabled
        >
          <template #prefix>
            <icon-cube-three />
          </template>
          <template #suffix>
            <view>获取验证码</view>
          </template>
        </tsm-input>
      </view>

      <view class="section">
        <text class="section-title">只读的输入框</text>
        <tsm-input
          v-model="inputValue9"
          placeholder="请输入内容"
          tips="这是一段提示内容"
          clearable
          showWordimit
          class="input-demo"
          readonly
        >
          <template #prefix>
            <icon-cube-three />
          </template>
          <template #suffix>
            <view>获取验证码</view>
          </template>
        </tsm-input>
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
const inputValue8 = ref('禁用状态');
const inputValue9 = ref(
  '只读状态只读状态只读状态只读状态只读状态只读状态只读状态只读状态只读状态只读状态只读状态只读状态只读状态只读状态只读状态只读状态只读状态只读状态只读状态只读状态只读状态只读状态只读状态只读状态只读状态只读状态只读状态'
);

const handleInput = (event: any) => {
  console.log(event.detail.value, 'outer', inputValue1.value);
};

const handleConfirm = (event: any) => {
  alert(event.detail.value);
  console.log(event.detail.value, 'confirm');
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
