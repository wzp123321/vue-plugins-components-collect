<template>
  <div class="deep-seek">
    <!-- 消息容器 -->
    <div class="chat-container">
      <div v-for="(msg, index) in messages" :key="index" :class="['message', msg.role]">
        {{ msg.content }}
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <input v-model="inputText" @keyup.enter="sendMessage" placeholder="有什么可以帮您？" />
      <button @click="sendMessage">发送</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

// 消息类型定义
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const messages = ref<Message[]>([]);
const inputText = ref('');

const sendMessage = () => {
  if (!inputText.value.trim()) return;

  // 添加用户消息
  messages.value.push({
    role: 'user',
    content: inputText.value,
  });

  // 模拟AI回复
  setTimeout(() => {
    messages.value.push({
      role: 'assistant',
      content: '好的，我正在思考您的问题...',
    });
  }, 1000);

  inputText.value = '';
};
</script>

<style lang="less" scoped>
.deep-seek {
  display: flex;
  flex-direction: column;
  height: 100vh;

  .chat-container {
    flex: 1;
    overflow-y: auto;
    padding: 20px;

    .message {
      max-width: 70%;
      margin: 10px;
      padding: 12px 16px;
      border-radius: 8px;

      &.user {
        background: #2d8cf0;
        color: white;
        margin-left: auto;
      }

      &.assistant {
        background: #f5f5f5;
        margin-right: auto;
        border: 1px solid #eee;
      }
    }
  }

  .input-area {
    display: flex;
    padding: 20px;
    border-top: 1px solid #eee;

    input {
      flex: 1;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      margin-right: 10px;
    }

    button {
      padding: 12px 24px;
      background: #2d8cf0;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    }
  }
}
</style>
