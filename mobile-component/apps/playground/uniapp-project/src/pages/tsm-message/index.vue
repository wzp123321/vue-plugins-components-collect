<template>
  <tsm-theme-provider>
    <view class="container">
      <view class="header">
        <text class="title">Message 消息提示</text>
      </view>

      <view class="demo-card">
        <text class="section-title">基础类型</text>
        <view class="demo-grid demo-grid--wide">
          <view class="demo-item demo-item--wide">
            <tsm-button theme="primary" label="info 提示" @click="showMessage('info')"></tsm-button>
          </view>
          <view class="demo-item demo-item--wide">
            <tsm-button theme="primary" label="success 提示" @click="showMessage('success')"></tsm-button>
          </view>
          <view class="demo-item demo-item--wide">
            <tsm-button theme="primary" label="warning 提示" @click="showMessage('warning')"></tsm-button>
          </view>
          <view class="demo-item demo-item--wide">
            <tsm-button theme="primary" label="error 提示" @click="showMessage('error')"></tsm-button>
          </view>
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">扩展示例</text>
        <view class="demo-grid demo-grid--wide">
          <view class="demo-item demo-item--wide">
            <tsm-button theme="primary" label="长文案（2秒）" @click="showLongMessage"></tsm-button>
          </view>
          <view class="demo-item demo-item--wide">
            <tsm-button theme="primary" label="手动关闭" @click="showManualClose"></tsm-button>
          </view>
          <view class="demo-item demo-item--wide">
            <tsm-button theme="primary" label="Link 跳转" @click="showLinkMessage"></tsm-button>
          </view>
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">操作按钮</text>
        <view class="demo-grid demo-grid--wide">
          <view class="demo-item demo-item--wide">
            <tsm-button theme="primary" label="仅关闭按钮" @click="showOnlyClose"></tsm-button>
          </view>
          <view class="demo-item demo-item--wide">
            <tsm-button theme="primary" label="仅 Link" @click="showOnlyLink"></tsm-button>
          </view>
        </view>
      </view>

      <tsm-message
        v-model:visible="visible"
        :type="msgType"
        :message="msgText"
        :duration="msgDuration"
        :rightAction="msgRightAction"
        @tap="handleTap"
      ></tsm-message>
    </view>
  </tsm-theme-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue';

type MessageType = 'info' | 'success' | 'warning' | 'error';

const visible = ref(false);
const msgType = ref<string>('');
const msgText = ref<string>('');
const msgDuration = ref<number>(3000);
const msgRightAction = ref<string>('close');

const showMessage = (type: MessageType) => {
  msgType.value = type;
  msgText.value = `这是一条 ${type} 消息`;
  msgDuration.value = 3000;
  msgRightAction.value = 'close';
  visible.value = true;
};

const showLongMessage = () => {
  msgType.value = 'info';
  msgText.value =
    '这是一条较长的较长的较长的较长的较长的较长的较长的较长的提示文案，用于演示多行文本在 Message 组件里的展示效果。';
  msgDuration.value = 2000;
  msgRightAction.value = 'close';
  visible.value = true;
};

const showManualClose = () => {
  msgType.value = 'warning';
  msgText.value = '点击右侧按钮可立即关闭';
  msgDuration.value = 0;
  msgRightAction.value = 'close';
  visible.value = true;
};

const showLinkMessage = () => {
  msgType.value = 'success';
  msgText.value = '操作成功，点击 Link 查看详情';
  msgDuration.value = 0;
  msgRightAction.value = 'link';
  visible.value = true;
};

const showOnlyClose = () => {
  msgType.value = 'info';
  msgText.value =
    '仅显示关闭按钮仅显示关闭按钮仅显示关闭按钮仅显示关闭按钮仅显示关闭按钮仅显示关闭按钮仅显示关闭按钮仅显示关闭按钮仅显示关闭按钮仅显示关闭按钮仅显示关闭按钮仅显示关闭按钮仅显示关闭按钮仅显示关闭按钮仅显示关闭按钮仅显示关闭按钮仅显示关闭按钮';
  msgDuration.value = 0;
  msgRightAction.value = 'close';
  visible.value = true;
};

const showOnlyLink = () => {
  msgType.value = 'info';
  msgText.value = '仅显示 Link';
  msgDuration.value = 0;
  msgRightAction.value = 'link';
  visible.value = true;
};

const handleTap = () => {
  visible.value = false;
};
</script>

<style scoped lang="scss">
@import '@/uni_modules/@tiansu/ts-mobile-ui/libs/scss/platform-style.scss';

.container {
  padding: 12px;
  background: #f7f8fa;
  height: 100vh;
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
  font-weight: 700;
  margin-bottom: 10px;
  color: #111827;
}

.demo-grid {
  display: flex;
  flex-wrap: wrap;
}

.demo-grid .demo-item {
  margin-right: 12px;
  margin-bottom: 10px;
}

.demo-grid--wide .demo-item {
  margin-right: 10px;
  margin-bottom: 8px;
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
</style>
