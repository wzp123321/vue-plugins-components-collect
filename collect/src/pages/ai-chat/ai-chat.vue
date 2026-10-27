<template>
  <div class="chat-page">
    <div class="chat-shell">
      <aside class="chat-side">
        <button class="chat-side__new" @click="newSession">＋ 新会话</button>
        <div
          v-for="(session, index) in sessions"
          :key="session.id"
          class="chat-side__item"
          :class="{ 'is-active': index === activeSession }"
          @click="activeSession = index"
        >
          <span class="chat-side__item-title">{{ session.title }}</span>
          <span class="chat-side__item-count">{{ session.messages.length }}</span>
        </div>
        <p class="chat-side__tip">
          会话数据结构即后端协议：messages 顺序追加，流式时最后一条 content 持续 patch。
        </p>
      </aside>

      <div class="chat-main">
        <div ref="scrollEl" class="chat-main__list">
          <div
            v-for="msg in active.messages"
            :key="msg.id"
            class="chat-msg"
            :class="`chat-msg--${msg.role}`"
          >
            <span class="chat-msg__avatar">{{ msg.role === 'user' ? '🧑' : '🤖' }}</span>
            <div class="chat-msg__bubble">
              <template v-for="block in parseBlocks(msg.content)" :key="block.id">
                <pre v-if="block.type === 'code'" class="chat-msg__code">{{ block.text }}</pre>
                <p v-else class="chat-msg__text" v-html="renderInline(block.text)"></p>
              </template>
              <span v-if="msg.streaming" class="chat-msg__cursor">▍</span>
            </div>
          </div>
          <div v-if="active.messages.length === 0" class="chat-main__empty">
            试试问：写一个防抖函数 / 什么是 SSE
          </div>
        </div>

        <div class="chat-main__input">
          <textarea
            v-model="draft"
            class="chat-main__textarea"
            rows="2"
            placeholder="Enter 发送 · Shift+Enter 换行"
            @keydown.enter.exact.prevent="send"
          ></textarea>
          <button class="chat-main__send" :disabled="pending" @click="send">
            {{ pending ? '停止' : '发送' }}
          </button>
        </div>

        <p class="chat-main__note">
          演示用本地模拟流式；接真实后端时把 fakeStream 换成 fetch SSE
          读流（参考「SSE 流式数据」页），消息协议保持一致。
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref } from 'vue';

defineOptions({ name: 'AiChatDemo' });

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
}

interface ChatSession {
  id: number;
  title: string;
  messages: ChatMessage[];
}

let uid = 0;
const nextId = () => ++uid;

const sessions = ref<ChatSession[]>([
  { id: nextId(), title: '新会话', messages: [] },
]);
const activeSession = ref(0);
const active = computed(() => sessions.value[activeSession.value]);

const draft = ref('');
const pending = ref(false);
const scrollEl = ref<HTMLElement | null>(null);
let streamTimer: ReturnType<typeof setInterval> | null = null;

const scrollBottom = async () => {
  await nextTick();
  scrollEl.value?.scrollTo({ top: scrollEl.value.scrollHeight });
}

/** 极简会话标题：取用户第一条消息前 12 字 */
const appendMessage = (role: ChatMessage['role'], content = ''): ChatMessage => {
  const msg: ChatMessage = { id: nextId(), role, content, streaming: role === 'assistant' };
  active.value.messages.push(msg);
  if (role === 'user' && active.value.messages.length === 1) {
    active.value.title = content.slice(0, 12) || '新会话';
  }
  scrollBottom();
  return msg;
}

const newSession = () => {
  sessions.value.push({ id: nextId(), title: '新会话', messages: [] });
  activeSession.value = sessions.value.length - 1;
}

/* ---------------- 极简 Markdown：代码块 + 行内加粗/代码 ---------------- */
interface Block {
  id: number;
  type: 'code' | 'text';
  text: string;
}

const parseBlocks = (content: string): Block[] => {
  const blocks: Block[] = [];
  const parts = content.split(/```(?:\w*)\n?/);
  parts.forEach((part, index) => {
    if (!part) return;
    blocks.push({
      id: blocks.length,
      type: index % 2 === 1 ? 'code' : 'text',
      text: part.replace(/\n$/, ''),
    });
  });
  return blocks.length > 0 ? blocks : [{ id: 0, type: 'text', text: content }];
}

const renderInline = (text: string): string => {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return escaped
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />');
}

/* ---------------- 流式输出：本地模拟，接口形态与真实 SSE 一致 ---------------- */
const CANNED_ANSWERS: { match: RegExp; answer: string }[] = [
  {
    match: /防抖|debounce/,
    answer:
      '防抖的核心：**事件停止触发 n 毫秒后才执行**。\n\n```ts\nfunction debounce<T extends (...args: any[]) => void>(fn: T, wait = 300) {\n  let timer: ReturnType<typeof setTimeout>;\n  return (...args: Parameters<T>) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), wait);\n  };\n}\n```\n\n典型场景：搜索框联想、窗口 resize。与节流的区别见「工具函数合集」。',
  },
  {
    match: /sse|流式|stream/i,
    answer:
      'SSE（Server-Sent Events）是**服务端单向推送**的 HTTP 长连接。\n\n- 基于 `text/event-stream`，浏览器用 `EventSource` 或 fetch 读流\n- AI 对话的打字机效果就是它\n- 需要双向通信时再升级 WebSocket\n\n本站「SSE 流式数据」页有完整实现。',
  },
  {
    match: /.*/,
    answer:
      '这是一个本地模拟的流式回复：可以看到文字是**逐段到达**的，Markdown 代码块在流式过程中也能正常分块渲染。\n\n接入真实后端时，把 fakeStream 换成 `fetch` + `ReadableStream` 即可，消息协议不变。',
  },
];

const stopStream = () => {
  if (streamTimer) clearInterval(streamTimer);
  streamTimer = null;
  pending.value = false;
  active.value.messages.forEach((msg) => {
    msg.streaming = false;
  });
}

const send = () => {
  const text = draft.value.trim();
  if (!text || pending.value) return;
  draft.value = '';
  appendMessage('user', text);

  const answer = CANNED_ANSWERS.find((item) => item.match.test(text))!.answer;
  const reply = appendMessage('assistant');
  pending.value = true;

  // 模拟分片到达：每 30ms 推 2~4 个字符，与真实 SSE chunk 节奏一致
  let cursor = 0;
  streamTimer = setInterval(() => {
    cursor += 2 + Math.floor(Math.random() * 3);
    reply.content = answer.slice(0, cursor);
    scrollBottom();
    if (cursor >= answer.length) stopStream();
  }, 30);
}
</script>

<style lang="less" scoped>
.chat-page {
  height: 100%;
  padding: 16px;
}

.chat-shell {
  display: flex;
  height: 100%;
  min-height: 0;
  border: 1px solid var(--ai-border);
  border-radius: var(--ai-radius-md);
  background: var(--ai-surface-raised);
  overflow: hidden;
}

.chat-side {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 200px;
  flex-shrink: 0;
  padding: 12px;
  border-right: 1px solid var(--ai-hairline);

  &__new {
    height: 32px;
    border: 1px solid var(--ai-border);
    border-radius: 9px;
    background: var(--ai-gradient-soft);
    color: var(--ai-text);
    font-size: 12.5px;
    cursor: pointer;

    &:hover {
      border-color: rgba(124, 92, 255, 0.4);
    }
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: 8px;
    color: var(--ai-text-dim);
    font-size: 12px;
    cursor: pointer;

    &:hover {
      background: var(--ai-surface-hover);
    }

    &.is-active {
      background: var(--ai-surface-hover);
      color: var(--ai-text);
    }
  }

  &__item-title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__item-count {
    color: var(--ai-text-mute);
    font-family: var(--ai-font-mono);
    font-size: 10px;
  }

  &__tip {
    margin: auto 0 0;
    color: var(--ai-text-mute);
    font-size: 10.5px;
    line-height: 1.6;
  }
}

.chat-main {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  min-height: 0;

  &__list {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  &__empty {
    margin: auto;
    color: var(--ai-text-mute);
    font-size: 13px;
  }

  &__input {
    display: flex;
    align-items: flex-end;
    gap: 10px;
    padding: 12px 16px;
    border-top: 1px solid var(--ai-hairline);
  }

  &__textarea {
    flex: 1;
    resize: none;
    padding: 10px 12px;
    border: 1px solid var(--ai-border);
    border-radius: 10px;
    background: var(--ai-surface);
    color: var(--ai-text);
    font-family: var(--ai-font-sans);
    font-size: 13px;
    line-height: 1.6;

    &:focus {
      outline: none;
      border-color: rgba(124, 92, 255, 0.5);
    }
  }

  &__send {
    height: 38px;
    padding: 0 18px;
    border: 0;
    border-radius: 10px;
    background: var(--ai-gradient);
    color: #fff;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &__note {
    margin: 0;
    padding: 0 16px 10px;
    color: var(--ai-text-mute);
    font-size: 11px;
  }
}

.chat-msg {
  display: flex;
  gap: 10px;
  max-width: 82%;

  &--user {
    align-self: flex-end;
    flex-direction: row-reverse;
  }

  &__avatar {
    flex-shrink: 0;
    width: 30px;
    height: 30px;
    display: grid;
    place-items: center;
    border-radius: 9px;
    background: var(--ai-surface-hover);
    font-size: 15px;
  }

  &__bubble {
    position: relative;
    padding: 10px 14px;
    border: 1px solid var(--ai-hairline);
    border-radius: 12px;
    background: var(--ai-surface);
  }

  .chat-msg--user &__bubble {
    background: var(--ai-accent-soft);
    border-color: rgba(124, 92, 255, 0.3);
  }

  &__text {
    margin: 0;
    color: var(--ai-text);
    font-size: 13px;
    line-height: 1.7;
    word-break: break-word;
  }

  &__code {
    margin: 6px 0;
    padding: 10px 12px;
    border-radius: 8px;
    background: var(--ai-surface-solid);
    border: 1px solid var(--ai-hairline);
    color: var(--ai-text-dim);
    font-family: var(--ai-font-mono);
    font-size: 11.5px;
    line-height: 1.6;
    overflow-x: auto;
  }

  &__cursor {
    display: inline-block;
    margin-left: 2px;
    color: var(--ai-accent-2);
    animation: chat-blink 0.9s steps(1) infinite;
  }
}

@keyframes chat-blink {
  50% {
    opacity: 0;
  }
}
</style>
