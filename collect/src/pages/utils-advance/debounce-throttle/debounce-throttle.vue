<template>
  <div class="debounce-throttle-page">
    <h5>防抖 & 节流</h5>

    <!-- 可视化演示 -->
    <el-row :gutter="16" style="margin-bottom: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>🎯 防抖（Debounce）</span>
              <el-tag type="warning" size="small">延迟 {{ debounceDelay }}ms 执行</el-tag>
            </div>
          </template>
          <p class="desc-text">连续触发时，只有停止触发后 N 毫秒才执行一次。适合：搜索框输入、窗口resize。</p>
          <div class="demo-area">
            <el-input v-model="debounceInput" placeholder="快速输入，观察执行时机..." @input="handleDebounceInput" />
            <div class="counter-row">
              <span>
                输入次数：
                <b class="red">{{ debounceInputCount }}</b>
              </span>
              <span>
                实际执行：
                <b class="green">{{ debounceExecCount }}</b>
              </span>
            </div>
            <div class="log-box">
              <div v-for="(log, i) in debounceLogs" :key="i" :class="['log-item', log.type]">
                {{ log.time }} {{ log.msg }}
              </div>
            </div>
          </div>
          <div class="delay-control">
            <span>延迟时间：</span>
            <el-slider v-model="debounceDelay" :min="100" :max="2000" :step="100" style="flex: 1; margin: 0 12px" />
            <span>{{ debounceDelay }}ms</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>🚦 节流（Throttle）</span>
              <el-tag type="success" size="small">每 {{ throttleDelay }}ms 最多执行一次</el-tag>
            </div>
          </template>
          <p class="desc-text">在一段时间内，无论触发多少次，只执行一次。适合：滚动监听、鼠标移动、按钮连点防护。</p>
          <div class="demo-area">
            <el-button type="primary" style="width: 100%; margin-bottom: 12px" @click="handleThrottleClick">
              疯狂点击这个按钮！
            </el-button>
            <div class="counter-row">
              <span>
                点击次数：
                <b class="red">{{ throttleClickCount }}</b>
              </span>
              <span>
                实际执行：
                <b class="green">{{ throttleExecCount }}</b>
              </span>
            </div>
            <div class="log-box">
              <div v-for="(log, i) in throttleLogs" :key="i" :class="['log-item', log.type]">
                {{ log.time }} {{ log.msg }}
              </div>
            </div>
          </div>
          <div class="delay-control">
            <span>间隔时间：</span>
            <el-slider v-model="throttleDelay" :min="100" :max="2000" :step="100" style="flex: 1; margin: 0 12px" />
            <span>{{ throttleDelay }}ms</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 手写实现源码 -->
    <el-row :gutter="16">
      <el-col :span="12">
        <el-card>
          <template #header><span>📝 手写防抖实现</span></template>
          <pre class="code-block">{{ debounceCode }}</pre>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header><span>📝 手写节流实现</span></template>
          <el-tabs v-model="throttleTab">
            <el-tab-pane label="时间戳版" name="timestamp">
              <pre class="code-block">{{ throttleCodeTimestamp }}</pre>
            </el-tab-pane>
            <el-tab-pane label="定时器版" name="timer">
              <pre class="code-block">{{ throttleCodeTimer }}</pre>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>

    <!-- 对比说明 -->
    <el-card style="margin-top: 16px">
      <template #header><span>📊 对比总结</span></template>
      <el-table :data="compareData" border>
        <el-table-column prop="item" label="对比项" width="160" />
        <el-table-column prop="debounce" label="防抖 (Debounce)" />
        <el-table-column prop="throttle" label="节流 (Throttle)" />
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';

defineOptions({ name: 'DebounceThrottle' });

// ===== 防抖 =====
const debounceInput = ref('');
const debounceDelay = ref(500);
const debounceInputCount = ref(0);
const debounceExecCount = ref(0);
const debounceLogs = ref<{ type: string; time: string; msg: string }[]>([]);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

// 手写防抖函数
function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return function (this: unknown, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
}

function addLog(list: typeof debounceLogs.value, type: string, msg: string) {
  const now = new Date();
  const time = `${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
  list.unshift({ type, time, msg });
  if (list.length > 8) list.pop();
}

const debouncedSearch = debounce((val: unknown) => {
  const strVal = val as string;
  debounceExecCount.value++;
  addLog(debounceLogs.value, 'exec', `✅ 执行搜索: "${strVal}"`);
}, 500);

function handleDebounceInput(val: string) {
  debounceInputCount.value++;
  addLog(debounceLogs.value, 'trigger', `⌨️ 触发输入 #${debounceInputCount.value}`);
  debouncedSearch(val);
}

// 监听 delay 变化，重新创建防抖函数（简化处理：直接在调用时使用当前 delay）
watch(debounceDelay, () => {
  if (debounceTimer) clearTimeout(debounceTimer);
});

// ===== 节流 =====
const throttleDelay = ref(500);
const throttleClickCount = ref(0);
const throttleExecCount = ref(0);
const throttleLogs = ref<{ type: string; time: string; msg: string }[]>([]);
const throttleTab = ref('timestamp');

// 手写节流函数（时间戳版）
function throttle<T extends (...args: unknown[]) => void>(fn: T, interval: number) {
  let lastTime = 0;
  return function (this: unknown, ...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

const throttledAction = throttle(() => {
  throttleExecCount.value++;
  addLog(throttleLogs.value, 'exec', `✅ 执行动作 #${throttleExecCount.value}`);
}, 500);

function handleThrottleClick() {
  throttleClickCount.value++;
  addLog(throttleLogs.value, 'trigger', `🖱 点击 #${throttleClickCount.value}`);
  throttledAction();
}

// ===== 源码 =====
const debounceCode = `// 手写防抖 - 完整版（支持 immediate 立即执行）
function debounce(fn, delay, immediate = false) {
  let timer = null;
  
  return function(...args) {
    const callNow = immediate && !timer;
    
    if (timer) clearTimeout(timer);
    
    timer = setTimeout(() => {
      timer = null;
      if (!immediate) fn.apply(this, args);
    }, delay);
    
    // immediate 模式：第一次立即执行
    if (callNow) fn.apply(this, args);
  };
}

// 使用示例
const handleSearch = debounce((keyword) => {
  console.log('搜索:', keyword);
}, 500);

input.addEventListener('input', (e) => {
  handleSearch(e.target.value);
});

// lodash 版本
import { debounce } from 'lodash-es';
const search = debounce(fetchData, 300);`;

const throttleCodeTimestamp = `// 手写节流 - 时间戳版
// 特点：第一次立即执行，最后一次可能不执行
function throttle(fn, interval) {
  let lastTime = 0;
  
  return function(...args) {
    const now = Date.now();
    const remaining = interval - (now - lastTime);
    
    if (remaining <= 0) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}`;

const throttleCodeTimer = `// 手写节流 - 定时器版
// 特点：第一次延迟执行，最后一次必然执行
function throttle(fn, interval) {
  let timer = null;
  
  return function(...args) {
    if (!timer) {
      timer = setTimeout(() => {
        timer = null;
        fn.apply(this, args);
      }, interval);
    }
  };
}

// 完整版：结合时间戳 + 定时器
function throttleFull(fn, interval) {
  let lastTime = 0;
  let timer = null;
  
  return function(...args) {
    const now = Date.now();
    const remaining = interval - (now - lastTime);
    
    if (remaining <= 0) {
      if (timer) { clearTimeout(timer); timer = null; }
      lastTime = now;
      fn.apply(this, args);
    } else if (!timer) {
      timer = setTimeout(() => {
        lastTime = Date.now();
        timer = null;
        fn.apply(this, args);
      }, remaining);
    }
  };
}`;

const compareData = [
  { item: '核心思路', debounce: '重置计时器，停止后执行', throttle: '固定间隔内只执行一次' },
  { item: '执行时机', debounce: '停止触发 N ms 后执行', throttle: '每隔 N ms 至多执行一次' },
  { item: '第一次触发', debounce: '延迟后执行（或立即执行）', throttle: '立即执行（时间戳版）' },
  { item: '最后一次', debounce: '一定会执行', throttle: '可能不执行（时间戳版）' },
  { item: '适用场景', debounce: '搜索框、表单验证、窗口resize', throttle: '滚动监听、mousemove、按钮防连点' },
  { item: 'lodash 方法', debounce: '_.debounce(fn, wait)', throttle: '_.throttle(fn, wait)' },
];
</script>

<style lang="less" scoped>
.debounce-throttle-page {
  padding: 20px;
  h5 {
    margin: 0 0 20px;
    font-size: 20px;
  }
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.desc-text {
  font-size: 13px;
  color: #666;
  margin-bottom: 14px;
  line-height: 1.6;
}
.demo-area {
  margin-bottom: 12px;
}
.counter-row {
  display: flex;
  gap: 24px;
  margin: 10px 0;
  span {
    font-size: 13px;
  }
  .red {
    color: #f56c6c;
  }
  .green {
    color: #67c23a;
  }
}
.log-box {
  height: 160px;
  overflow-y: auto;
  background: #1e1e1e;
  border-radius: 6px;
  padding: 8px 10px;
}
.log-item {
  font-size: 12px;
  font-family: monospace;
  padding: 2px 0;
  line-height: 1.6;
  &.trigger {
    color: #aaa;
  }
  &.exec {
    color: #67c23a;
    font-weight: 600;
  }
}
.delay-control {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #666;
}
.code-block {
  background: #1e1e1e;
  color: #cdd;
  border-radius: 6px;
  padding: 14px;
  font-size: 12px;
  font-family: monospace;
  line-height: 1.7;
  overflow-x: auto;
  white-space: pre;
  margin: 0;
}
</style>
