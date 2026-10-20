<template>
  <view class="container">
    <tem-cell titleText="是否展示icon" layout="vertical" showContent>
      <template #content>
        <tem-switch
          checked
          @change="
            (e) => {
              showIcon = e.detail.value;
            }
          "
        ></tem-switch>
      </template>
    </tem-cell>
    <tem-cell titleText="是否展示背景遮罩" layout="vertical" showContent>
      <template #content>
        <tem-switch
          checked
          @change="
            (e) => {
              maskShow = e.detail.value;
            }
          "
        ></tem-switch>
      </template>
    </tem-cell>

    <tem-cell titleText="示例" layout="vertical" showContent>
      <template #content>
        <view style="display: flex; gap: 10px; flex-wrap: wrap">
          <tem-button
            v-for="item in types"
            :key="item"
            class="tem-button popup-success"
            @click="messageToggle(item)"
            ><text class="tem-button-text success-text">{{
              item
            }}</text></tem-button
          >
        </view>
      </template>
    </tem-cell>

    <view>
      <!-- 提示信息弹窗 -->
      <tem-popup-toast
        ref="message"
        :type="ToastType"
        :message="messageText"
        :showIcon="showIcon"
        :maskShow="maskShow"
        :duration="2000"
        >{{ messageText }}</tem-popup-toast
      >
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
// import {
//   TemPopupToast,
//   TemButton,
//   TemSwitch,
//   TemCell,
// } from '@tiansu/ts-mobile-package';

const messageText = ref('这是一条消息提示');
const message = ref();
const showIcon = ref(true);
const maskShow = ref(true);
const types = ['success', 'warning', 'loading', 'error'];
const ToastType = ref('success');

const messageToggle = (type: string) => {
  ToastType.value = type;
  messageText.value = `这是一条消息提示`;
  message.value.showToast();
};
</script>

<style lang="scss"></style>
