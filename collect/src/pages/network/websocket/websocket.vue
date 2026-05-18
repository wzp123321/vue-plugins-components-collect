<template>
  <div class="websocket-page">
    <h5>WebSocket 实时通信</h5>
    <el-alert type="info" :closable="false" style="margin-bottom:20px">
      演示 WebSocket 连接、发送消息、断线重连、心跳检测。
      使用公共 echo 服务（wss://echo.websocket.events）测试双向通信。
    </el-alert>

    <el-row :gutter="16">
      <el-col :span="14">
        <el-card>
          <template #header>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span>WebSocket 聊天室</span>
              <el-tag :type="wsStatus === 'connected' ? 'success' : wsStatus === 'connecting' ? 'warning' : 'danger'" size="small">
                {{ statusText }}
              </el-tag>
            </div>
          </template>

          <!-- 连接配置 -->
          <div class="conn-bar">
            <el-input v-model="wsUrl" placeholder="WebSocket URL" size="small" style="flex:1" :disabled="wsStatus === 'connected'" />
            <el-button v-if="wsStatus !== 'connected'" type="primary" size="small" @click="connect" :loading="wsStatus === 'connecting'">连接</el-button>
            <el-button v-else type="danger" size="small" @click="disconnect">断开</el-button>
          </div>

          <!-- 消息列表 -->
          <div class="msg-list" ref="msgListRef">
            <div v-for="(msg, i) in messages" :key="i" :class="['msg-item', msg.type]">
              <span class="msg-time">{{ msg.time }}</span>
              <span class="msg-content">{{ msg.content }}</span>
            </div>
            <div v-if="!messages.length" class="empty-hint">连接后发送消息...</div>
          </div>

          <!-- 发送区域 -->
          <div class="send-bar">
            <el-input
              v-model="inputMsg"
              placeholder="输入消息（Enter 发送）"
              size="small"
              :disabled="wsStatus !== 'connected'"
              @keyup.enter="sendMsg"
            />
            <el-button type="primary" size="small" :disabled="wsStatus !== 'connected'" @click="sendMsg">发送</el-button>
          </div>

          <!-- 快捷消息 -->
          <div class="quick-msgs" v-if="wsStatus === 'connected'">
            <el-button v-for="q in quickMessages" :key="q" size="small" @click="sendQuick(q)">{{ q }}</el-button>
          </div>

          <!-- 统计 -->
          <div class="stats">
            <span>发送：{{ sentCount }}</span>
            <span>接收：{{ receivedCount }}</span>
            <span>重连次数：{{ reconnectCount }}</span>
          </div>
        </el-card>
      </el-col>

      <el-col :span="10">
        <el-card>
          <template #header>封装代码</template>
          <el-tabs>
            <el-tab-pane label="基础封装">
              <pre class="code-block">{{ wsCode }}</pre>
            </el-tab-pane>
            <el-tab-pane label="心跳检测">
              <pre class="code-block">{{ heartbeatCode }}</pre>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, nextTick, onUnmounted } from 'vue';

defineOptions({ name: 'WebSocketDemo' });

const wsUrl = ref('wss://echo.websocket.events');
const wsStatus = ref<'disconnected' | 'connecting' | 'connected'>('disconnected');
const messages = ref<{ type: string; content: string; time: string }[]>([]);
const inputMsg = ref('');
const msgListRef = ref<HTMLDivElement>();
const sentCount = ref(0);
const receivedCount = ref(0);
const reconnectCount = ref(0);

const quickMessages = ['Hello WebSocket!', 'Ping', '当前时间: ' + new Date().toLocaleTimeString(), '{"type":"chat","msg":"测试JSON"}'];

const statusText = { connected: '✅ 已连接', connecting: '⏳ 连接中...', disconnected: '🔴 未连接' }[wsStatus.value] ?? '';

let ws: WebSocket | null = null;
let heartbeatTimer: number;
let reconnectTimer: number;
let reconnectAttempts = 0;
const MAX_RECONNECT = 3;

const addMsg = (type: string, content: string) => {
  messages.value.push({ type, content, time: new Date().toLocaleTimeString() });
  nextTick(() => { if (msgListRef.value) msgListRef.value.scrollTop = msgListRef.value.scrollHeight; });
};

const connect = () => {
  wsStatus.value = 'connecting';
  addMsg('system', `⏳ 正在连接 ${wsUrl.value}...`);
  ws = new WebSocket(wsUrl.value);

  ws.onopen = () => {
    wsStatus.value = 'connected';
    reconnectAttempts = 0;
    addMsg('system', '✅ 连接成功！这是一个 echo 服务，会把你发的消息原样返回');
    startHeartbeat();
  };

  ws.onmessage = (e) => {
    receivedCount.value++;
    addMsg('received', `← ${e.data}`);
  };

  ws.onclose = (e) => {
    wsStatus.value = 'disconnected';
    stopHeartbeat();
    addMsg('system', `🔴 连接关闭 (code:${e.code})`);
    // 自动重连
    if (reconnectAttempts < MAX_RECONNECT) {
      reconnectAttempts++;
      reconnectCount.value++;
      const delay = 1000 * reconnectAttempts;
      addMsg('system', `⚡ ${delay / 1000}s 后自动重连（第 ${reconnectAttempts}/${MAX_RECONNECT} 次）`);
      reconnectTimer = window.setTimeout(connect, delay);
    }
  };

  ws.onerror = () => {
    addMsg('error', '❌ 连接出错（可能是网络问题或跨域限制）');
  };
};

const disconnect = () => {
  reconnectAttempts = MAX_RECONNECT; // 阻止自动重连
  clearTimeout(reconnectTimer);
  ws?.close(1000, '手动关闭');
};

const sendMsg = () => {
  if (!inputMsg.value.trim() || !ws || ws.readyState !== WebSocket.OPEN) return;
  ws.send(inputMsg.value);
  addMsg('sent', `→ ${inputMsg.value}`);
  sentCount.value++;
  inputMsg.value = '';
};

const sendQuick = (msg: string) => {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  ws.send(msg);
  addMsg('sent', `→ ${msg}`);
  sentCount.value++;
};

const startHeartbeat = () => {
  heartbeatTimer = window.setInterval(() => {
    if (ws?.readyState === WebSocket.OPEN) ws.send('ping');
  }, 30000);
};

const stopHeartbeat = () => clearInterval(heartbeatTimer);

onUnmounted(() => {
  reconnectAttempts = MAX_RECONNECT;
  clearTimeout(reconnectTimer);
  stopHeartbeat();
  ws?.close();
});

const wsCode = `// useWebSocket.ts
class WebSocketManager {
  private ws: WebSocket | null = null
  private url: string
  private reconnectAttempts = 0
  private readonly MAX_RECONNECT = 5

  connect(url: string) {
    this.url = url
    this.ws = new WebSocket(url)

    this.ws.onopen = () => this.onConnected()
    this.ws.onmessage = (e) => this.onMessage(e.data)
    this.ws.onclose = () => this.scheduleReconnect()
    this.ws.onerror = (e) => this.onError(e)
  }

  send(data: string | object) {
    const msg = typeof data === 'object'
      ? JSON.stringify(data) : data
    this.ws?.send(msg)
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.MAX_RECONNECT) return
    const delay = 1000 * Math.pow(2, this.reconnectAttempts)
    setTimeout(() => this.connect(this.url), delay)
    this.reconnectAttempts++
  }
}`;

const heartbeatCode = `// 心跳检测
let heartbeatTimer: number
let missedPongs = 0

const startHeartbeat = () => {
  heartbeatTimer = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'ping' }))
      missedPongs++

      // 超过 3 次未收到 pong 则重连
      if (missedPongs > 3) {
        ws.close()
        reconnect()
      }
    }
  }, 15000)
}

// 收到 pong 时重置
ws.onmessage = (e) => {
  const data = JSON.parse(e.data)
  if (data.type === 'pong') {
    missedPongs = 0  // 重置计数
  }
}`;
</script>

<style lang="less" scoped>
.websocket-page { padding: 20px; overflow-y: auto; }
.conn-bar { display: flex; gap: 8px; margin-bottom: 12px; }
.msg-list {
  height: 280px; overflow-y: auto; border: 1px solid #e4e7ed; border-radius: 6px;
  padding: 8px; background: #fafafa;

  .msg-item {
    display: flex; align-items: flex-start; gap: 8px; margin-bottom: 6px; font-size: 13px;
    &.system .msg-content { color: #909399; }
    &.sent .msg-content { color: #409eff; }
    &.received .msg-content { color: #67c23a; }
    &.error .msg-content { color: #f56c6c; }
    .msg-time { color: #bbb; font-size: 11px; flex-shrink: 0; padding-top: 2px; }
  }
  .empty-hint { color: #ccc; text-align: center; padding: 40px 0; font-size: 13px; }
}
.send-bar { display: flex; gap: 8px; margin-top: 12px; }
.quick-msgs { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.stats {
  display: flex; gap: 16px; margin-top: 8px; font-size: 12px; color: #999;
  span { background: #f0f2f5; padding: 2px 8px; border-radius: 10px; }
}
.code-block {
  background: #1e1e2e; color: #cdd6f4; border-radius: 8px;
  padding: 14px; font-size: 11px; line-height: 1.7; overflow-x: auto; white-space: pre;
}
</style>
