<template>
  <view class="container">
    <uni-section title="对话框示例" type="line" class="hideOnPc">
      <view class="example-body box">
        <tem-button class="tem-button popup-success" @click="dialogToggle()"
          ><text class="tem-button-text success-text">示例</text></tem-button
        >
      </view>
    </uni-section>

    <uni-section title="输入框示例" type="line" padding>
      <view class="dialog-box">
        <text class="dialog-text">输入内容：{{ value }}</text>
      </view>
      <tem-button class="tem-button" type="primary" @click="inputDialogToggle"
        ><text class="tem-button-text">输入对话框</text></tem-button
      >
    </uni-section>

    <view>
      <!-- 提示窗示例 -->
      <tem-dialog
        ref="alertDialog"
        cancelText="关闭"
        confirmText="同意"
        title="通知"
        content="欢迎使用 tem-popup!"
        @confirm="dialogConfirm"
        @close="dialogClose"
      ></tem-dialog>
    </view>

    <view>
      <!-- 输入框示例 -->
      <tem-dialog
        ref="inputDialog"
        mode="input"
        title="输入内容"
        value="对话框预置提示内容!"
        placeholder="请输入内容"
        @confirm="dialogInputConfirm"
      ></tem-dialog>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
// import { TemDialog, TemButton } from '@tiansu/ts-mobile-package';
// import UniSection from '@tiansu/ts-mobile-package/uni-section/components/uni-section/uni-section.vue';

const messageText = ref('这是一条成功提示');
const value = ref('');
const alertDialog = ref();
const inputDialog = ref();

const dialogInputConfirm = (val) => {
  uni.showLoading({
    title: '3秒后会关闭',
  });

  setTimeout(() => {
    uni.hideLoading();
    console.log(val);
    value.value = val;
    // 关闭窗口后，恢复默认内容
    inputDialog.value.close();
  }, 3000);
};
const dialogToggle = () => {
  alertDialog.value.open();
};
const inputDialogToggle = (type) => {
  inputDialog.value.open();
};
const dialogConfirm = (type) => {
  console.log('点击确认');
};
const dialogClose = (type) => {
  console.log('点击关闭');
};
</script>

<style lang="scss">
@mixin flex {
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  flex-direction: row;
}

@mixin height {
  /* #ifndef APP-NVUE */
  height: 100%;
  /* #endif */
  /* #ifdef APP-NVUE */
  flex: 1;
  /* #endif */
}

.box {
  @include flex;
}

.button {
  @include flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 35px;
  margin: 0 5px;
  border-radius: 5px;
}

.example-body {
  background-color: #fff;
  padding: 10px;
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.dialog-box {
  padding: 10px;
}
</style>
