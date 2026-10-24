<!-- 本示例未包含完整css，获取外链css请参考上文，在hello uni-app项目中查看 -->
<template>
  <view>
    <view class="uni-common-mt">
      <view class="uni-form-item uni-column">
        <tem-cell titleText="可自动聚焦的input" layout="vertical" showContent>
          <template #content>
            <tem-input class="uni-input" focus placeholder="自动获得焦点" />
          </template>
        </tem-cell>
      </view>
      <view class="uni-form-item uni-column">
        <tem-cell
          titleText="键盘右下角按钮显示为搜索"
          layout="vertical"
          showContent
        >
          <template #content>
            <tem-input
              class="uni-input"
              confirm-type="search"
              placeholder="键盘右下角按钮显示为搜索"
            />
          </template>
        </tem-cell>
      </view>
      <view class="uni-form-item uni-column">
        <tem-cell
          titleText="控制最大输入长度的input"
          layout="vertical"
          showContent
        >
          <template #content>
            <tem-input
              class="uni-input"
              maxlength="10"
              placeholder="最大输入长度为10"
            />
          </template>
        </tem-cell>
      </view>
      <view class="uni-form-item uni-column">
        <tem-cell
          :titleText="`实时获取输入值：${inputValue}`"
          layout="vertical"
          showContent
        >
          <template #content>
            <tem-input
              class="uni-input"
              @input="onKeyInput"
              placeholder="输入同步到view中"
            />
          </template>
        </tem-cell>
        <view class="title"></view>
      </view>
      <view class="uni-form-item uni-column">
        <tem-cell titleText="控制输入的input" layout="vertical" showContent>
          <template #content>
            <tem-input
              class="uni-input"
              @input="replaceInput"
              v-model="changeValue"
              placeholder="连续的两个1会变成2"
            />
          </template>
        </tem-cell>
      </view>
      <!-- #ifndef MP-BAIDU -->
      <view class="uni-form-item uni-column">
        <tem-cell titleText="控制键盘的input" layout="vertical" showContent>
          <template #content>
            <tem-input
              class="uni-input"
              ref="input1"
              @input="hideKeyboard"
              placeholder="输入123自动收起键盘"
            />
          </template>
        </tem-cell>
      </view>
      <!-- #endif -->
      <view class="uni-form-item uni-column">
        <tem-cell titleText="数字输入的input" layout="vertical" showContent>
          <template #content>
            <tem-input
              class="uni-input"
              type="number"
              placeholder="这是一个数字输入框"
            />
          </template>
        </tem-cell>
      </view>
      <view class="uni-form-item uni-column">
        <tem-cell titleText="密码输入的input" layout="vertical" showContent>
          <template #content>
            <tem-input
              class="uni-input"
              password
              type="text"
              placeholder="这是一个密码输入框"
            />
          </template>
        </tem-cell>
      </view>
      <view class="uni-form-item uni-column">
        <tem-cell titleText="带小数点的input" layout="vertical" showContent>
          <template #content>
            <tem-input
              class="uni-input"
              type="digit"
              placeholder="带小数点的数字键盘"
            />
          </template>
        </tem-cell>
      </view>
      <view class="uni-form-item uni-column">
        <tem-cell titleText="身份证输入的input" layout="vertical" showContent>
          <template #content>
            <tem-input
              class="uni-input"
              type="idcard"
              placeholder="身份证输入键盘"
            />
          </template>
        </tem-cell>
      </view>
      <view class="uni-form-item uni-column">
        <tem-cell
          titleText="控制占位符颜色的input"
          layout="vertical"
          showContent
        >
          <template #content>
            <tem-input
              class="uni-input"
              placeholder-style="color:#F76260"
              placeholder="占位符字体是红色的"
            />
          </template>
        </tem-cell>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
// import { TemInput, TemCell } from '@zpackage/mobile-package';

const inputValue = ref('');
const changeValue = ref('');
const inputClearValue = ref('');
const showPassword = ref(true);
const showClearIcon = ref(false);

const onKeyInput = (e) => {
  inputValue.value = e.detail.value;
};
const replaceInput = (event) => {
  var value = event.detail.value;
  if (value === '11') {
    changeValue.value = '2';
  }
};
const hideKeyboard = (event) => {
  if (event.detail.value === '123') {
    uni.hideKeyboard();
  }
};
const changePassword = (event) => {
  showPassword.value = !showPassword.value;
};
const clearInput = (event) => {
  inputClearValue.value = event.detail.value;
  if (event.detail.value.length > 0) {
    showClearIcon.value = true;
  } else {
    showClearIcon.value = false;
  }
};
const clearIcon = () => {
  inputClearValue.value = '';
  showClearIcon.value = false;
};
</script>

<style lang="scss"></style>
