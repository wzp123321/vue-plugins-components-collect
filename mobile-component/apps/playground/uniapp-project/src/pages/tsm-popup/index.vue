<template>
  <tsm-theme-provider>
    <view class="container">
      <div class="title" @click="show = true">底部弹窗</div>
      <div class="title" @click="showleft = true">左侧弹窗</div>
      <div style="height: 5000px"></div>
      <tsm-popup v-model:show="show" mode="bottom" closeable @open="open" @close="close">
        <template #header>
          <view>弹窗标题</view>
        </template>
        <div style="height: 500px">弹窗内容</div>
        <template #footer>
          <tsm-button style="flex: 1" @click="show = false">取消</tsm-button>
          <tsm-button type="primary" style="flex: 1" @click="show = false">确认</tsm-button>
        </template>
      </tsm-popup>
      <tsm-popup v-model:show="showleft" mode="left" closeable>
        <div style="width: 300px">弹窗内容</div>
      </tsm-popup>
    </view>
  </tsm-theme-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const show = ref(false);
const showleft = ref(false);

const open = () => {
  console.log('Popup opened');
};

const close = () => {
  console.log('Popup closed');
};
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
  @include tsm-flex-wrap-gap-item(15px);
}

.event-log {
  margin-top: 20px;
  font-size: 20px;
  color: #999;
}
</style>
