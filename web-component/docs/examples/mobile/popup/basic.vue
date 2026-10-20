<template>
  <view class="container">
    <uni-card is-full :is-shadow="false">
      <text class="uni-h6"
        >弹出层组件用于弹出一个覆盖到页面上的内容，使用场景如：底部弹出分享弹窗、页面插屏广告等。</text
      >
    </uni-card>
    <uni-section title="基本示例" type="line">
      <view class="example-body box">
        <tem-button class="tem-button" type="primary" @click="toggle('top')"
          ><text class="tem-button-text">顶部</text></tem-button
        >
        <tem-button class="tem-button" type="primary" @click="toggle('bottom')"
          ><text class="tem-button-text">底部</text></tem-button
        >
        <tem-button class="tem-button" type="primary" @click="toggle('center')"
          ><text class="tem-button-text">居中</text></tem-button
        >
        <tem-button class="tem-button" type="primary" @click="toggle('left')"
          ><text class="tem-button-text">左侧</text></tem-button
        >
        <tem-button class="tem-button" type="primary" @click="toggle('right')"
          ><text class="tem-button-text">右侧</text></tem-button
        >
      </view>
    </uni-section>

    <view>
      <!-- 普通弹窗 -->
      <tem-popup ref="popup" background-color="#fff" @change="change">
        <view
          class="popup-content"
          :class="{ 'popup-height': typeVal === 'left' || typeVal === 'right' }"
          ><text class="text">popup 内容</text></view
        >
      </tem-popup>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
// import { TemPopup, TemButton } from '@tiansu/ts-mobile-package';
// import UniSection from '@tiansu/ts-mobile-package/uni-section/components/uni-section/uni-section.vue';
// import UniCard from '@tiansu/ts-mobile-package/uni-card/components/uni-card/uni-card.vue';

const typeVal = ref('center');
const popup = ref();

const change = (e) => {
  console.log('当前模式：' + e.type + ',状态：' + e.show);
};
const toggle = (type) => {
  typeVal.value = type;
  // open 方法传入参数 等同在 uni-popup 组件上绑定 type属性
  popup.value.open(type);
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

.button-text {
  color: #fff;
  font-size: 12px;
}

.popup-content {
  @include flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
  height: 50px;
  background-color: #fff;
}

.popup-height {
  @include height;
  width: 200px;
}

.text {
  font-size: 12px;
  color: #333;
}

.popup-success {
  color: #fff;
  background-color: #e1f3d8;
}

.popup-warn {
  color: #fff;
  background-color: #faecd8;
}

.popup-error {
  color: #fff;
  background-color: #fde2e2;
}

.popup-info {
  color: #fff;
  background-color: #f2f6fc;
}

.success-text {
  color: #09bb07;
}

.warn-text {
  color: #e6a23c;
}

.error-text {
  color: #f56c6c;
}

.info-text {
  color: #909399;
}

.dialog,
.share {
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  flex-direction: column;
}

.dialog-box {
  padding: 10px;
}

.dialog .button,
.share .button {
  /* #ifndef APP-NVUE */
  width: 100%;
  /* #endif */
  margin: 0;
  margin-top: 10px;
  padding: 3px 0;
  flex: 1;
}

.dialog-text {
  font-size: 14px;
  color: #333;
}
</style>
