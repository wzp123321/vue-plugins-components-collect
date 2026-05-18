<template>
  <div class="sse-page">
    <h5>SSE — Server-Sent Events 流式数据</h5>
    <el-alert type="info" :closable="false" style="margin-bottom:20px">
      SSE 是单向的服务器→客户端推送，常用于 <strong>AI 流式输出、实时通知、进度推送</strong>等场景。
      相比 WebSocket 更简单（基于 HTTP），自带断线重连。
    </el-alert>

    <el-row :gutter="16">
      <el-col :span="14">
        <el-card>
          <template #header>① 模拟 AI 流式输出（fetch + ReadableStream）</template>
          <div class="ai-chat">
            <div class="messages" ref="msgRef">
              <div v-for="(msg, i) in chatMessages" :key="i" :class="['msg', msg.role]">
                <div class="msg-bubble">
                  <span v-if="msg.role === 'ai'" class="ai-label">AI</span>
                  <span>{{ msg.content }}</span>
                  <span v-if="msg.streaming" class="cursor">▋</span>
                </div>
              </div>
            </div>
            <div class="input-bar">
              <el-input v-model="question" placeholder="输入问题..." :disabled="streaming" @keyup.enter="askAI" />
              <el-button type="primary" @click="askAI" :loading="streaming" :disabled="streaming">{{ streaming ? '生成中...' : '发送' }}</el-button>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="10">
        <el-card style="margin-bottom:16px">
          <template #header>② 原生 EventSource API</template>
          <div class="demo-section">
            <div style="display:flex;gap:8px;margin-bottom:12px">
              <el-button type="primary" size="small" @click="startSSE" :disabled="sseActive">连接 SSE</el-button>
              <el-button type="danger" size="small" @click="stopSSE" :disabled="!sseActive">断开</el-button>
              <el-tag :type="sseActive ? 'success' : 'info'" size="small">{{ sseActive ? '连接中' : '未连接' }}</el-tag>
            </div>
            <div class="sse-events">
              <div v-for="(e, i) in sseEvents" :key="i" class="sse-event">
                <span class="event-type">{{ e.type }}</span>
                <span class="event-data">{{ e.data }}</span>
                <span class="event-time">{{ e.time }}</span>
              </div>
              <div v-if="!sseEvents.length" style="color:#ccc;text-align:center;padding:20px;font-size:13px">点击「连接 SSE」开始接收事件</div>
            </div>
          </div>
        </el-card>

        <el-card>
          <template #header>💻 SSE 实现对比</template>
          <el-tabs size="small">
            <el-tab-pane label="EventSource">
              <pre class="code-block">{{ eventSourceCode }}</pre>
            </el-tab-pane>
            <el-tab-pane label="fetch+流">
              <pre class="code-block">{{ fetchStreamCode }}</pre>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, nextTick, onUnmounted } from 'vue';

defineOptions({ name: 'SSEDemo' });

// ===== AI 流式输出（模拟）=====
const chatMessages = ref<{ role: string; content: string; streaming?: boolean }[]>([
  { role: 'ai', content: '你好！我是 AI 助手。你可以问我任何问题，我会用流式输出来回答。' },
]);
const question = ref('');
const streaming = ref(false);
const msgRef = ref<HTMLDivElement>();

const aiResponses: Record<string, string> = {
  default: '这是一个 SSE 流式输出的演示。在实际项目中，AI 的回答会像这样一个字一个字地流出来，给用户良好的等待体验。你可以通过 fetch + ReadableStream 来实现这种效果，也可以使用 EventSource API 来接收服务器推送的事件。',
};

const getResponse = (q: string) => {
  const lower = q.toLowerCase();
  if (lower.includes('websocket')) return 'WebSocket 是一种双向通信协议，建立连接后客户端和服务器都可以主动发送消息，适合聊天室、协同编辑等场景。';
  if (lower.includes('sse')) return 'SSE（Server-Sent Events）是单向推送，只有服务器能发消息给客户端。它基于 HTTP，简单易用，天然支持断线重连，非常适合 AI 流式输出、进度推送等场景。';
  if (lower.includes('vue')) return 'Vue3 是一个渐进式前端框架，核心特性包括：Composition API、响应式系统（基于 Proxy）、Teleport、Suspense、Fragment、defineModel 等新特性，生态完善，性能优秀。';
  return aiResponses.default;
};

const askAI = async () => {
  if (!question.value.trim() || streaming.value) return;
  const q = question.value;
  question.value = '';
  chatMessages.value.push({ role: 'user', content: q });

  streaming.value = true;
  const aiMsg = { role: 'ai', content: '', streaming: true };
  chatMessages.value.push(aiMsg);

  const response = getResponse(q);
  const chars = response.split('');

  for (const char of chars) {
    await new Promise((r) => setTimeout(r, 30 + Math.random() * 40));
    aiMsg.content += char;
    await nextTick();
    if (msgRef.value) msgRef.value.scrollTop = msgRef.value.scrollHeight;
  }

  aiMsg.streaming = false;
  streaming.value = false;
};

// ===== 原生 EventSource 模拟 =====
const sseActive = ref(false);
const sseEvents = ref<{ type: string; data: string; time: string }[]>([]);
let sseTimer: number;
let sseEventTypes = ['message', 'notification', 'update', 'heartbeat'];

const startSSE = () => {
  sseActive.value = true;
  sseEvents.value = [];
  let count = 0;

  // 模拟 SSE 事件流（实际使用 new EventSource('/api/sse')）
  sseTimer = window.setInterval(() => {
    count++;
    const type = sseEventTypes[Math.floor(Math.random() * sseEventTypes.length)];
    const dataMap: Record<string, string> = {
      message: `新消息：用户${Math.floor(Math.random() * 100)} 说了些什么`,
      notification: `通知：订单 #${Math.floor(Math.random() * 10000)} 状态更新`,
      update: `数据更新：指标值 ${(Math.random() * 100).toFixed(2)}`,
      heartbeat: `ping ${count}`,
    };
    sseEvents.value.unshift({ type, data: dataMap[type], time: new Date().toLocaleTimeString() });
    if (sseEvents.value.length > 20) sseEvents.value.pop();
  }, 1500);
};

const stopSSE = () => {
  sseActive.value = false;
  clearInterval(sseTimer);
};

onUnmounted(() => {
  clearInterval(sseTimer);
});

const eventSourceCode = `// 浏览器原生 EventSource
const es = new EventSource('/api/events', {
  withCredentials: true,  // 携带 cookie
})

// 默认 message 事件
es.onmessage = (e) => {
  console.log(e.data)
}

// 自定义事件类型
es.addEventListener('notification', (e) => {
  showNotification(JSON.parse(e.data))
})

es.onerror = () => {
  // 自动重连，无需手动处理
}

es.close()  // 主动关闭`;

const fetchStreamCode = `// fetch + ReadableStream（更灵活，支持 POST）
const response = await fetch('/api/ai/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Hello' }),
})

const reader = response.body!.getReader()
const decoder = new TextDecoder()

while (true) {
  const { done, value } = await reader.read()
  if (done) break

  const chunk = decoder.decode(value)

  // 解析 SSE 格式
  const lines = chunk.split('\\n')
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6)
      if (data === '[DONE]') break
      const json = JSON.parse(data)
      outputText += json.choices[0].delta.content
    }
  }
}`;
</script>

<style lang="less" scoped>
.sse-page { padding: 20px; overflow-y: auto; }
.ai-chat {
  .messages {
    height: 320px; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 12px;
    .msg {
      display: flex;
      &.user { justify-content: flex-end; .msg-bubble { background: #409eff; color: #fff; } }
      &.ai .msg-bubble { background: #f5f7fa; color: #303133; }
    }
    .msg-bubble {
      max-width: 80%; padding: 10px 14px; border-radius: 12px; font-size: 14px; line-height: 1.6;
      .ai-label { font-weight: 600; color: #409eff; margin-right: 6px; font-size: 12px; }
      .cursor { animation: blink 0.8s infinite; }
    }
  }
  .input-bar { display: flex; gap: 8px; margin-top: 12px; }
}
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
.sse-events {
  max-height: 180px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px;
  .sse-event {
    display: flex; align-items: center; gap: 8px; font-size: 12px; padding: 4px 8px;
    border-radius: 4px; background: #f5f7fa;
    .event-type { min-width: 80px; font-weight: 500; color: #409eff; }
    .event-data { flex: 1; color: #606266; }
    .event-time { color: #bbb; }
  }
}
.code-block {
  background: #1e1e2e; color: #cdd6f4; border-radius: 8px;
  padding: 14px; font-size: 11px; line-height: 1.7; overflow-x: auto; white-space: pre;
}
</style>
