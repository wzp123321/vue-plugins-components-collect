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
            <tsm-button type="primary" text="info 提示" @click="showMessage('info')"></tsm-button>
          </view>
          <view class="demo-item demo-item--wide">
            <tsm-button type="success" text="success 提示" @click="showMessage('success')"></tsm-button>
          </view>
          <view class="demo-item demo-item--wide">
            <tsm-button type="warning" text="warning 提示" @click="showMessage('warning')"></tsm-button>
          </view>
          <view class="demo-item demo-item--wide">
            <tsm-button type="danger" text="error 提示" @click="showMessage('error')"></tsm-button>
          </view>
        </view>
      </view>

      <view class="demo-card">
        <text class="section-title">扩展示例</text>
        <view class="demo-grid demo-grid--wide">
          <view class="demo-item demo-item--wide">
            <tsm-button text="长文案（2秒）" @click="showLongMessage"></tsm-button>
          </view>
          <view class="demo-item demo-item--wide">
            <tsm-button text="手动关闭" @click="showManualClose"></tsm-button>
          </view>
        </view>
      </view>

      <tsm-message ref="messageRef">
        <template #button>
          <text class="action-text" @tap="closeMessage">关闭</text>
        </template>
      </tsm-message>
    </view>
  </tsm-theme-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue';

type MessageType = 'info' | 'success' | 'warning' | 'error';
type MessageRef = {
  show: (options: { type?: MessageType; message?: string; duration?: number }) => void;
  close: () => void;
};

const messageRef = ref<MessageRef | null>(null);

const showMessage = (type: MessageType) => {
  messageRef.value?.show({
    type,
    message: `这是一条 ${type} 消息`,
  });
};

const showLongMessage = () => {
  messageRef.value?.show({
    type: 'info',
    message: '这是一条较长的提示文案，用于演示多行文本在 Message 组件里的展示效果。',
    duration: 2000,
  });
};

const showManualClose = () => {
  messageRef.value?.show({
    type: 'warning',
    message: '点击右侧按钮可立即关闭',
    duration: 0,
  });
};

const closeMessage = () => {
  messageRef.value?.close();
};
</script>

<style scoped lang="scss">
@import '@/uni_modules/@tiansu/ts-mobile-ui/libs/scss/platform-style.scss';

.container {
  padding: 16px;
  background: #f7f8fa;
  min-height: 100vh;
  box-sizing: border-box;
}

.header {
  padding: 12px 12px 6px;
  margin-bottom: 12px;
}

.title {
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  color: #111827;
  line-height: 1.2;
}

.demo-card {
  background: #ffffff;
  border: 1px solid #eef2f7;
  border-radius: 16px;
  padding: 18px 16px 14px;
  margin-bottom: 14px;
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 14px;
  color: #111827;
}

.demo-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 14px 18px;
}

.demo-grid--wide {
  gap: 12px 14px;
}

.demo-item {
  width: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.demo-item--wide {
  width: 100%;
  align-items: flex-start;
}

.action-text {
  color: var(--tsm-color-primary);
  font-size: 14px;
}
</style>
