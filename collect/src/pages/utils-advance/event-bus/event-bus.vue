<template>
  <div class="event-bus-page">
    <h5>事件总线 mitt</h5>
    <p class="page-desc">
      事件总线是一种发布/订阅模式，可以在任意两个组件之间通信，不受父子关系限制。
      Vue3 中移除了内置的 EventBus，推荐使用 <code>mitt</code> 库。
    </p>

    <!-- 架构图 -->
    <el-card style="margin-bottom:16px">
      <template #header><span>🏗 组件通信架构</span></template>
      <div class="arch-diagram">
        <div class="arch-node sender" @click="sendGlobalMsg">
          <div class="node-icon">📤</div>
          <div class="node-name">组件 A（发送方）</div>
          <div class="node-hint">点击发送消息</div>
        </div>
        <div class="arch-arrows">
          <div class="arrow-line">
            <div class="arrow-label">emit('message', data)</div>
            <div class="arrow-body">→→→</div>
            <div class="arrow-label">EVENT BUS</div>
            <div class="arrow-body">→→→</div>
          </div>
        </div>
        <div class="arch-node receiver">
          <div class="node-icon">📥</div>
          <div class="node-name">组件 B（接收方）</div>
          <div class="received-msg" v-if="receivedMessages.length">
            最新：{{ receivedMessages[0].content }}
          </div>
          <div class="node-hint" v-else>等待消息...</div>
        </div>
      </div>
    </el-card>

    <!-- 实时演示 -->
    <el-row :gutter="16" style="margin-bottom:16px">
      <el-col :span="12">
        <el-card class="comp-card">
          <template #header>
            <div class="card-header">
              <span>📤 组件 A — 发送方</span>
              <el-tag type="danger" size="small">Publisher</el-tag>
            </div>
          </template>
          <div class="sender-form">
            <el-input v-model="msgContent" placeholder="输入消息内容" style="margin-bottom:10px" />
            <el-select v-model="msgType" style="width:100%;margin-bottom:10px">
              <el-option label="普通消息 (message)" value="message" />
              <el-option label="通知 (notify)" value="notify" />
              <el-option label="主题切换 (theme)" value="theme" />
            </el-select>
            <el-button type="primary" style="width:100%" @click="emitEvent">
              🚀 发送事件
            </el-button>
          </div>
          <div class="emit-log">
            <div class="log-title">发送记录</div>
            <div v-for="(log, i) in emitLogs" :key="i" class="log-item emit">
              <span class="log-time">{{ log.time }}</span>
              <el-tag :type="typeMap[log.type]" size="small">{{ log.type }}</el-tag>
              <span class="log-content">{{ log.content }}</span>
            </div>
            <div v-if="!emitLogs.length" class="empty-log">暂无发送记录</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="comp-card">
          <template #header>
            <div class="card-header">
              <span>📥 组件 B — 接收方</span>
              <el-tag type="success" size="small">Subscriber</el-tag>
            </div>
          </template>
          <div class="subscribe-info">
            <div class="sub-item" v-for="evt in subscribedEvents" :key="evt.name">
              <span class="sub-dot" :class="evt.active ? 'active' : ''"></span>
              <span>已订阅：<code>{{ evt.name }}</code></span>
              <el-tag :type="typeMap[evt.name]" size="small" style="margin-left:auto">{{ evt.desc }}</el-tag>
            </div>
          </div>
          <div class="recv-log">
            <div class="log-title">接收记录</div>
            <div v-for="(log, i) in receivedMessages" :key="i" class="log-item recv">
              <span class="log-time">{{ log.time }}</span>
              <el-tag :type="typeMap[log.type]" size="small">{{ log.type }}</el-tag>
              <span class="log-content">{{ log.content }}</span>
            </div>
            <div v-if="!receivedMessages.length" class="empty-log">等待接收消息...</div>
          </div>
          <el-button size="small" style="margin-top:8px" @click="receivedMessages=[]">清空</el-button>
        </el-card>
      </el-col>
    </el-row>

    <!-- 安装与用法 -->
    <el-row :gutter="16">
      <el-col :span="12">
        <el-card>
          <template #header><span>📦 安装 & 封装 emitter</span></template>
          <pre class="code-block">{{ installCode }}</pre>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header><span>💡 组件中使用</span></template>
          <pre class="code-block">{{ usageCode }}</pre>
        </el-card>
      </el-col>
    </el-row>

    <!-- mitt vs EventBus -->
    <el-card style="margin-top:16px">
      <template #header><span>📊 方案对比</span></template>
      <el-table :data="compareData" border>
        <el-table-column prop="item" label="对比项" width="160" />
        <el-table-column prop="mitt" label="mitt（推荐）" />
        <el-table-column prop="vue2bus" label="Vue2 EventBus" />
        <el-table-column prop="pinia" label="Pinia（复杂状态）" />
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';

defineOptions({ name: 'EventBus' });

// 极简手写事件总线（实际项目用 mitt）
type EventHandler = (...args: unknown[]) => void;
class MiniMitt {
  private events: Map<string, EventHandler[]> = new Map();
  on(event: string, handler: EventHandler) {
    const handlers = this.events.get(event) || [];
    handlers.push(handler);
    this.events.set(event, handlers);
  }
  off(event: string, handler: EventHandler) {
    const handlers = this.events.get(event) || [];
    this.events.set(event, handlers.filter(h => h !== handler));
  }
  emit(event: string, ...args: unknown[]) {
    (this.events.get(event) || []).forEach(h => h(...args));
  }
  clear() { this.events.clear(); }
}

const emitter = new MiniMitt();

// 状态
const msgContent = ref('Hello from 组件A!');
const msgType = ref('message');
const emitLogs = ref<{ time: string; type: string; content: string }[]>([]);
const receivedMessages = ref<{ time: string; type: string; content: string }[]>([]);

const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
  message: 'primary',
  notify: 'warning',
  theme: 'success',
};

const subscribedEvents = ref([
  { name: 'message', desc: '普通消息', active: true },
  { name: 'notify', desc: '通知', active: true },
  { name: 'theme', desc: '主题', active: true },
]);

function getTime() {
  const d = new Date();
  return `${d.getSeconds().toString().padStart(2,'0')}.${d.getMilliseconds().toString().slice(0,2)}`;
}

function emitEvent() {
  if (!msgContent.value.trim()) return;
  emitter.emit(msgType.value, msgContent.value);
  emitLogs.value.unshift({ time: getTime(), type: msgType.value, content: msgContent.value });
  if (emitLogs.value.length > 8) emitLogs.value.pop();
}

function sendGlobalMsg() {
  msgContent.value = `全局广播消息 ${Date.now().toString().slice(-4)}`;
  msgType.value = 'message';
  emitEvent();
}

function onMessage(content: unknown) {
  receivedMessages.value.unshift({ time: getTime(), type: 'message', content: String(content) });
  if (receivedMessages.value.length > 8) receivedMessages.value.pop();
}
function onNotify(content: unknown) {
  receivedMessages.value.unshift({ time: getTime(), type: 'notify', content: String(content) });
  if (receivedMessages.value.length > 8) receivedMessages.value.pop();
}
function onTheme(content: unknown) {
  receivedMessages.value.unshift({ time: getTime(), type: 'theme', content: `主题切换：${String(content)}` });
  if (receivedMessages.value.length > 8) receivedMessages.value.pop();
}

onMounted(() => {
  emitter.on('message', onMessage);
  emitter.on('notify', onNotify);
  emitter.on('theme', onTheme);
});

onUnmounted(() => {
  emitter.off('message', onMessage);
  emitter.off('notify', onNotify);
  emitter.off('theme', onTheme);
});

// 代码展示
const installCode = `# 安装
pnpm add mitt

# src/utils/emitter.ts（全局单例）
import mitt from 'mitt';

// 定义事件类型（TypeScript）
type Events = {
  message: string;
  notify: { title: string; type: 'info' | 'warn' | 'error' };
  theme: 'light' | 'dark';
  logout: void;
};

const emitter = mitt<Events>();
export default emitter;`;

const usageCode = `// 发送方组件
import emitter from '@/utils/emitter';

function sendMsg() {
  emitter.emit('message', '你好！');
  emitter.emit('notify', { title: '操作成功', type: 'info' });
}

// 接收方组件
import { onMounted, onUnmounted } from 'vue';
import emitter from '@/utils/emitter';

onMounted(() => {
  // 订阅事件
  emitter.on('message', (msg) => {
    console.log('收到消息:', msg);
  });
});

onUnmounted(() => {
  // ⚠️ 必须在组件卸载时取消订阅，防止内存泄漏
  emitter.off('message');
  // 或取消所有: emitter.all.clear()
});`;

const compareData = [
  { item: '包大小', mitt: '~200B（极小）', vue2bus: '需创建 Vue 实例', pinia: '相对较大' },
  { item: 'TypeScript', mitt: '完整类型支持', vue2bus: '较弱', pinia: '完整支持' },
  { item: '通配符 *', mitt: '支持 emitter.on("*")', vue2bus: '不支持', pinia: '不适用' },
  { item: '适用场景', mitt: '简单跨组件事件', vue2bus: 'Vue2 老项目', pinia: '复杂状态共享' },
  { item: '内存泄漏风险', mitt: '需手动 off', vue2bus: '需手动 $off', pinia: '自动管理' },
];
</script>

<style lang="less" scoped>
.event-bus-page {
  padding: 20px;
  h5 { margin: 0 0 8px; font-size: 20px; }
  .page-desc { color: #666; font-size: 13px; margin-bottom: 20px; line-height: 1.7; code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; } }
}
.card-header { display: flex; align-items: center; justify-content: space-between; }
.arch-diagram {
  display: flex; align-items: center; justify-content: center; gap: 20px; padding: 20px 0;
  .arch-node {
    width: 160px; padding: 16px; border-radius: 12px; text-align: center; border: 2px solid #ddd;
    cursor: pointer; transition: all 0.2s;
    &:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    &.sender { border-color: #409eff; background: #ecf5ff; }
    &.receiver { border-color: #67c23a; background: #f0f9eb; }
    .node-icon { font-size: 32px; margin-bottom: 8px; }
    .node-name { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
    .node-hint { font-size: 11px; color: #999; }
    .received-msg { font-size: 11px; color: #67c23a; font-weight: 600; word-break: break-all; }
  }
  .arch-arrows {
    flex: 1; text-align: center;
    .arrow-label { font-size: 11px; color: #409eff; font-family: monospace; }
    .arrow-body { font-size: 18px; color: #409eff; margin: 4px 0; }
  }
}
.comp-card { height: 100%; }
.sender-form { margin-bottom: 16px; }
.subscribe-info {
  margin-bottom: 12px;
  .sub-item { display: flex; align-items: center; gap: 8px; padding: 6px 0; border-bottom: 1px solid #f5f5f5; font-size: 13px; code { background: #f5f5f5; padding: 1px 5px; border-radius: 3px; font-size: 12px; } }
  .sub-dot { width: 8px; height: 8px; border-radius: 50%; background: #ccc; &.active { background: #67c23a; } }
}
.log-title { font-size: 12px; color: #999; margin-bottom: 6px; }
.emit-log, .recv-log { min-height: 80px; }
.log-item {
  display: flex; align-items: center; gap: 8px; padding: 4px 0; border-bottom: 1px solid #f5f5f5;
  .log-time { font-size: 11px; color: #bbb; font-family: monospace; min-width: 36px; }
  .log-content { font-size: 12px; color: #333; flex: 1; }
}
.empty-log { font-size: 12px; color: #ccc; text-align: center; padding: 16px 0; }
.code-block {
  background: #1e1e1e; color: #cdd; border-radius: 6px; padding: 14px;
  font-size: 12px; font-family: monospace; line-height: 1.7;
  overflow-x: auto; white-space: pre; margin: 0;
}
</style>
