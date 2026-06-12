<template>
  <tsm-theme-provider>
    <view class="container">
      <view class="header">
        <text class="title">Textarea 多行文本框</text>
        <text class="subtitle">用于输入多行文本内容</text>
      </view>

      <!-- 基础用法 -->
      <view class="demo-card">
        <text class="section-title">基础用法</text>
        <tsm-textarea class="textarea" v-model:value="value1" :rows="3" />
        <text class="result">当前值：{{ value1 }}</text>
      </view>

      <!-- 自定义 placeholder -->
      <view class="demo-card">
        <text class="section-title">自定义 placeholder</text>
        <tsm-textarea class="textarea" v-model:value="value2" placeholder="请描述您遇到的问题..." :rows="3" />
      </view>

      <!-- 字数统计 -->
      <view class="demo-card">
        <text class="section-title">字数统计</text>
        <tsm-textarea
          class="textarea"
          v-model:value="value3"
          placeholder="最多输入 200 字"
          :rows="4"
          :maxlength="200"
          show-count
        />
      </view>

      <!-- 语音输入插槽 -->
      <view class="demo-card">
        <text class="section-title">左下角插槽（语音输入示例）</text>
        <tsm-textarea
          class="textarea"
          v-model:value="value4"
          placeholder="请输入内容"
          :rows="4"
          :maxlength="200"
          show-count
        >
          <template #footer-left>
            <view class="voice-btn">
              <text class="voice-icon">🎤</text>
              <text class="voice-text">语音输入</text>
            </view>
          </template>
        </tsm-textarea>
      </view>

      <!-- 错误状态 -->
      <view class="demo-card">
        <text class="section-title">错误状态（边框变红）</text>
        <tsm-textarea class="textarea" v-model:value="value5" placeholder="输入内容校验失败时展示" :rows="3" error />
      </view>

      <!-- 禁用状态 -->
      <view class="demo-card">
        <text class="section-title">禁用状态</text>
        <tsm-textarea class="textarea" v-model:value="value6" placeholder="禁用状态不可输入" :rows="3" disabled />
      </view>

      <!-- 设置高度 -->
      <view class="demo-card">
        <text class="section-title">设置高度（200px）</text>
        <tsm-textarea class="textarea" v-model:value="value7" placeholder="设置固定高度" :rows="3" height="200px" />
      </view>

      <!-- 只读状态 -->
      <view class="demo-card">
        <text class="section-title">只读状态</text>
        <tsm-textarea class="textarea" v-model:value="value8" :rows="3" readonly />
      </view>

      <!-- 只读状态 - 长文本展开收起 -->
      <view class="demo-card" style="height: auto">
        <text class="section-title">只读状态 - 长文本展开收起</text>
        <tsm-textarea class="textarea" v-model:value="value9" :rows="3" readonly />
      </view>

      <!-- 事件测试 -->
      <view class="demo-card">
        <text class="section-title">事件测试</text>
        <tsm-textarea
          v-model:value="value10"
          placeholder="聚焦、失焦、输入都会触发事件"
          :rows="3"
          @focus="onFocus"
          @blur="onBlur"
          @input="onInput"
          @change="onChange"
        />
        <text class="result">事件记录：{{ eventLog }}</text>
      </view>
    </view>
  </tsm-theme-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const value1 = ref('');
const value2 = ref('');
const value3 = ref('');
const value4 = ref('');
const value5 = ref('');
const value6 = ref('这是禁用状态的默认值');
const value7 = ref('');
const value8 = ref('这是只读状态的默认值，不可编辑');
const value9 = ref('这是一段很长的只读文本，用于测试展开收起功能。'.repeat(20));
const value10 = ref('');
const eventLog = ref<string>('');

const onFocus = () => {
  eventLog.value = '触发了 focus';
};

const onBlur = () => {
  eventLog.value = '触发了 blur';
};

const onInput = (val: string) => {
  eventLog.value = `触发了 input，当前值长度：${val.length}`;
};

const onChange = (val: string) => {
  eventLog.value = `触发了 change，当前值长度：${val.length}`;
};
</script>

<style scoped lang="scss">
@import '@/uni_modules/@tiansu/ts-mobile-ui/libs/scss/platform-style.scss';

.container {
  padding: 12px;
  background: #f7f8fa;
  height: 100%;
  box-sizing: border-box;
}

.header {
  padding: 10px 10px 4px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  color: #111827;
  line-height: 1.2;
}

.subtitle {
  margin-top: 10px;
  font-size: 18px;
  color: #6b7280;
  text-align: center;
  line-height: 1.2;
}

.demo-card {
  height: 200px;
  background: #ffffff;
  border: 1px solid #eef2f7;
  border-radius: 12px;
  padding: 14px 12px 12px;
  margin-bottom: 10px;
  overflow: hidden;
  .textarea {
    height: 180px;
  }
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 10px;
  color: #111827;
}

.result {
  font-size: 12px;
  color: #666;
  margin-top: 10px;
  display: block;
}

.voice-btn {
  display: flex;
  align-items: center;
  gap: 4px;
}

.voice-icon {
  font-size: 14px;
}

.voice-text {
  font-size: 12px;
  color: #6172f3;
}
</style>
