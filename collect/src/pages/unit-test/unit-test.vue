<template>
  <div class="test-page">
    <header class="test-page__head">
      <h3 class="test-page__title">单元测试示例（Vitest）</h3>
      <p class="stip">
        工程已内置 vitest；真正可持续的单测不是覆盖率高，而是把「改了怕坏的纯逻辑」圈起来。
        下面用站内两个 utils 的真实用例演示。
      </p>
    </header>

    <div class="test-page__layout">
      <section class="test-card">
        <h4>测试文件写法</h4>
        <pre class="test-card__code">import { describe, it, expect } from 'vitest';
import { debounce, throttle } from '@/utils/tool';

describe('防抖 debounce', () => {
  it('停止触发 wait 毫秒后才执行一次', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced(); debounced(); debounced();
    vi.advanceTimersByTime(299);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});</pre>
        <p class="test-card__cmd">运行：npx vitest run / watch 模式：npx vitest</p>
      </section>

      <section class="test-card">
        <h4>页内迷你运行器（同款用例的即时演示）</h4>
        <button class="test-card__run" @click="run">▶ 运行断言</button>
        <div class="test-card__results">
          <div
            v-for="result in results"
            :key="result.name"
            class="test-case"
            :class="{ 'is-pass': result.pass, 'is-fail': !result.pass }"
          >
            <span class="test-case__mark">{{ result.pass ? '✓' : '✗' }}</span>
            <span class="test-case__name">{{ result.name }}</span>
            <span class="test-case__detail">{{ result.detail }}</span>
          </div>
          <p v-if="results.length === 0" class="test-card__placeholder">点击运行查看结果</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

defineOptions({ name: 'UnitTestDemo' });

interface CaseResult {
  name: string;
  pass: boolean;
  detail: string;
}

const results = ref<CaseResult[]>([]);

/** 页内可跑的同款逻辑：防抖（简化版） */
const debounce = <T extends (...args: never[]) => void>(fn: T, wait = 300) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

/** 简化版深合并 */
const deepMerge = <T extends Record<string, unknown>>(base: T, patch: Record<string, unknown>): T => {
  const out = { ...base };
  Object.entries(patch).forEach(([key, value]) => {
    out[key as keyof T] = (
      value && typeof value === 'object' && !Array.isArray(value)
        ? deepMerge(out[key] as Record<string, unknown>, value as Record<string, unknown>)
        : value
    ) as T[keyof T];
  });
  return out;
}

const run = async () => {
  results.value = [];

  // 1. 防抖：300ms 内多次触发只执行最后一次
  await new Promise<void>((resolve) => {
    let calls = 0;
    const debounced = debounce(() => calls++);
    debounced();
    debounced();
    debounced();
    setTimeout(() => {
      results.value.push({
        name: 'debounce 合并连续调用',
        pass: calls === 1,
        detail: `3 次触发，实际执行 ${calls} 次（期望 1）`,
      });
      resolve();
    }, 400);
  });

  // 2. 防抖：wait 未到不执行
  await new Promise<void>((resolve) => {
    let calls = 0;
    const debounced = debounce(() => calls++, 200);
    debounced();
    setTimeout(() => {
      results.value.push({
        name: 'debounce wait 内不执行',
        pass: calls === 0,
        detail: `100ms 时执行 ${calls} 次（期望 0）`,
      });
      resolve();
    }, 100);
  });

  // 3. 深合并：嵌套对象合并而非覆盖
  const merged = deepMerge({ a: { x: 1, y: 2 }, b: 1 }, { a: { y: 3 } });
  results.value.push({
    name: 'deepMerge 嵌套合并',
    pass: JSON.stringify(merged) === '{"a":{"x":1,"y":3},"b":1}',
    detail: `结果 ${JSON.stringify(merged)}`,
  });

  // 4. 深合并：数组直接替换
  const merged2 = deepMerge({ list: [1, 2, 3] }, { list: [9] });
  results.value.push({
    name: 'deepMerge 数组替换',
    pass: JSON.stringify(merged2) === '{"list":[9]}',
    detail: `结果 ${JSON.stringify(merged2)}`,
  });
}
</script>

<style lang="less" scoped>
.test-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;

  &__title {
    margin: 0 0 6px;
    color: var(--ai-text);
    font-size: 18px;
  }

  &__layout {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 14px;
  }
}

.stip {
  margin: 0;
  color: var(--ai-text-dim);
  font-size: 13px;
  line-height: 1.7;
}

.test-card {
  padding: 16px;
  border: 1px solid var(--ai-border);
  border-radius: var(--ai-radius-md);
  background: var(--ai-surface-raised);

  h4 {
    margin: 0 0 10px;
    color: var(--ai-text);
    font-size: 13.5px;
  }

  &__code {
    margin: 0 0 10px;
    padding: 12px;
    border-radius: var(--ai-radius-sm);
    background: var(--ai-surface);
    border: 1px solid var(--ai-hairline);
    color: var(--ai-text-dim);
    font-family: var(--ai-font-mono);
    font-size: 11px;
    line-height: 1.7;
    overflow: auto;
  }

  &__cmd {
    margin: 0;
    color: var(--ai-text-mute);
    font-family: var(--ai-font-mono);
    font-size: 11px;
  }

  &__run {
    margin-bottom: 12px;
    height: 34px;
    padding: 0 18px;
    border: 0;
    border-radius: 9px;
    background: var(--ai-gradient);
    color: #fff;
    font-size: 12.5px;
    font-weight: 500;
    cursor: pointer;
  }

  &__results {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__placeholder {
    margin: 0;
    color: var(--ai-text-mute);
    font-size: 12px;
    text-align: center;
    padding: 20px 0;
  }
}

.test-case {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--ai-hairline);
  font-size: 12px;

  &.is-pass {
    border-color: rgba(52, 211, 153, 0.35);
    background: rgba(52, 211, 153, 0.06);

    .test-case__mark {
      color: #34d399;
    }
  }

  &.is-fail {
    border-color: rgba(248, 113, 113, 0.4);
    background: rgba(248, 113, 113, 0.06);

    .test-case__mark {
      color: #f87171;
    }
  }

  &__name {
    color: var(--ai-text);
    flex-shrink: 0;
  }

  &__detail {
    color: var(--ai-text-mute);
    font-family: var(--ai-font-mono);
    font-size: 10.5px;
  }
}
</style>
