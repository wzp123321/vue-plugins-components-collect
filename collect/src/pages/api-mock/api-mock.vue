<template>
  <div class="mock-page">
    <header class="mock-page__head">
      <h3 class="mock-page__title">接口 Mock（axios adapter 层）</h3>
      <p class="mock-page__desc">
        不引 msw 的轻量方案：请求拦截器里按 URL 命中 mock 表，直接接管 adapter。
        后端就绪前前端先行，开关一关即切真实接口。
      </p>
    </header>

    <div class="mock-page__toolbar">
      <label class="mock-toggle">
        <input v-model="mockEnabled" type="checkbox" />
        Mock 总开关（{{ mockEnabled ? '开：命中 mock 表走假数据' : '关：走真实请求' }}）
      </label>
      <label class="mock-toggle">
        模拟延迟 {{ delay }}ms
        <input v-model.number="delay" type="range" min="0" max="2000" step="100" />
      </label>
    </div>

    <div class="mock-page__layout">
      <section class="mock-card">
        <h4>Mock 表（url → 响应）</h4>
        <div v-for="(item, url) in mockTable" :key="url" class="mock-card__row">
          <code class="mock-card__url">{{ url }}</code>
          <span class="mock-card__desc">{{ item.desc }}</span>
          <button class="mock-card__call" @click="call(url)">调用</button>
        </div>
        <p class="mock-card__tip">
          调用「关闭开关」的接口观察真实请求 404 —— 这就是上线时删掉 mock 的演练方式。
        </p>
      </section>

      <section class="mock-card">
        <h4>请求日志</h4>
        <div class="mock-card__logs">
          <div v-for="(log, index) in logs" :key="index" class="mock-log" :class="`is-${log.type}`">
            <span class="mock-log__time">{{ log.time }}</span>
            <code>{{ log.url }}</code>
            <span class="mock-log__tag">{{ log.tag }}</span>
            <span class="mock-log__body">{{ log.body }}</span>
          </div>
          <p v-if="logs.length === 0" class="mock-card__empty">左侧点「调用」发起请求</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import axios from 'axios';

defineOptions({ name: 'ApiMockDemo' });

const mockEnabled = ref(true);
const delay = ref(400);
const logs = reactive<{ time: string; url: string; tag: string; body: string; type: 'mock' | 'real' }[]>([]);

/** mock 表：url → 响应数据；真实项目可拆成独立目录按业务域维护 */
const mockTable = reactive<Record<string, { desc: string; data: unknown }>>({
  '/api/user/profile': {
    desc: '用户信息',
    data: { code: '0', data: { name: 'wanzp', role: 'admin' } },
  },
  '/api/metrics/summary': {
    desc: '指标汇总',
    data: { code: '0', data: { pv: 12890, reuse: '63%' } },
  },
  '/api/real/only': {
    desc: '不在 mock 表（演示真实请求）',
    data: null,
  },
});

/** 演示用独立实例；业务项目把这个拦截器装进 services/http 的单例 */
const http = axios.create({ timeout: 5000 });

http.interceptors.request.use(async (config) => {
  const entry = mockTable[config.url ?? '/'];
  if (mockEnabled.value && entry?.data) {
    await sleep(delay.value);
    config.adapter = async () => ({
      data: entry.data,
      status: 200,
      statusText: 'OK (mock)',
      headers: {},
      config,
    });
  }
  return config;
});

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function call(url: string) {
  const started = Date.now();
  try {
    const { data } = await http.get(url);
    logs.unshift({
      time: new Date().toLocaleTimeString(),
      url,
      tag: '✅',
      body: `${JSON.stringify(data)} · ${Date.now() - started}ms`,
      type: 'mock',
    });
  } catch (error) {
    logs.unshift({
      time: new Date().toLocaleTimeString(),
      url,
      tag: '🌐',
      body: `真实请求失败：${(error as Error).message} · ${Date.now() - started}ms`,
      type: 'real',
    });
  }
}
</script>

<style lang="less" scoped>
.mock-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 20px;

  &__title {
    margin: 0 0 6px;
    color: var(--ai-text);
    font-size: 18px;
  }

  &__desc {
    margin: 0;
    color: var(--ai-text-dim);
    font-size: 13px;
    line-height: 1.6;
  }

  &__toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    padding: 12px 16px;
    border: 1px solid var(--ai-border);
    border-radius: var(--ai-radius-md);
    background: var(--ai-surface-raised);
  }

  &__layout {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 14px;
  }
}

.mock-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--ai-text-dim);
  font-size: 12.5px;
  cursor: pointer;
}

.mock-card {
  padding: 16px;
  border: 1px solid var(--ai-border);
  border-radius: var(--ai-radius-md);
  background: var(--ai-surface-raised);

  h4 {
    margin: 0 0 12px;
    color: var(--ai-text);
    font-size: 13.5px;
  }

  &__row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
    border-bottom: 1px dashed var(--ai-hairline);
  }

  &__url {
    color: var(--ai-accent);
    font-family: var(--ai-font-mono);
    font-size: 11.5px;
  }

  &__desc {
    flex: 1;
    color: var(--ai-text-mute);
    font-size: 11.5px;
  }

  &__call {
    height: 26px;
    padding: 0 14px;
    border: 1px solid var(--ai-border);
    border-radius: 7px;
    background: var(--ai-surface);
    color: var(--ai-text-dim);
    font-size: 11.5px;
    cursor: pointer;

    &:hover {
      color: var(--ai-text);
      border-color: rgba(124, 92, 255, 0.4);
    }
  }

  &__tip {
    margin: 12px 0 0;
    color: var(--ai-text-mute);
    font-size: 11px;
    line-height: 1.7;
  }

  &__logs {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 320px;
    overflow-y: auto;
  }

  &__empty {
    margin: 0;
    padding: 24px 0;
    color: var(--ai-text-mute);
    font-size: 12px;
    text-align: center;
  }
}

.mock-log {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 7px;
  background: var(--ai-surface);
  border: 1px solid var(--ai-hairline);
  font-size: 11px;

  &.is-mock {
    border-color: rgba(52, 211, 153, 0.3);
  }

  &.is-real {
    border-color: rgba(248, 113, 113, 0.3);
  }

  &__time {
    color: var(--ai-text-mute);
    font-family: var(--ai-font-mono);
    flex-shrink: 0;
  }

  code {
    color: var(--ai-accent);
    font-family: var(--ai-font-mono);
    flex-shrink: 0;
  }

  &__tag {
    flex-shrink: 0;
  }

  &__body {
    color: var(--ai-text-dim);
    font-family: var(--ai-font-mono);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
