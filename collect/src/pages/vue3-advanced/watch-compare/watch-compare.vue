<template>
  <div class="watch-compare-page">
    <h5>watch / watchEffect / watchSyncEffect 对比</h5>
    <el-row :gutter="16">
      <!-- 控制面板 -->
      <el-col :span="8">
        <el-card>
          <template #header>🎮 操作面板</template>
          <div class="ctrl-item">
            <span>count：<strong>{{ count }}</strong></span>
            <el-button size="small" type="primary" @click="count++">count++</el-button>
          </div>
          <div class="ctrl-item" style="margin-top:12px">
            <span>name：<strong>{{ name }}</strong></span>
            <el-input v-model="name" size="small" style="width:120px" />
          </div>
          <div class="ctrl-item" style="margin-top:12px">
            <span>obj.x：<strong>{{ obj.x }}</strong></span>
            <el-button size="small" type="warning" @click="obj.x++">obj.x++</el-button>
          </div>
          <div class="ctrl-item" style="margin-top:12px">
            <el-button size="small" type="danger" @click="clearLogs">清空日志</el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 日志面板 -->
      <el-col :span="16">
        <el-card>
          <template #header>📋 执行日志（最新在上）</template>
          <div class="log-panel">
            <div
              v-for="(log, i) in logs"
              :key="i"
              class="log-item"
              :class="log.type"
            >
              <span class="log-badge">{{ log.type }}</span>
              <span class="log-msg">{{ log.msg }}</span>
              <span class="log-time">{{ log.time }}</span>
            </div>
            <div v-if="!logs.length" style="color:#999;text-align:center;padding:20px">
              点击上方按钮开始触发监听...
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top:16px">
      <el-col :span="8">
        <el-card>
          <template #header>① watch</template>
          <pre class="code-block">{{ watchCode }}</pre>
          <div class="desc-box">
            <p>✅ 惰性执行（初始不触发）</p>
            <p>✅ 明确指定监听源</p>
            <p>✅ 可获取 oldValue / newValue</p>
            <p>✅ immediate:true 可立即执行</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>② watchEffect</template>
          <pre class="code-block">{{ watchEffectCode }}</pre>
          <div class="desc-box">
            <p>✅ 立即执行（初始就触发）</p>
            <p>✅ 自动追踪内部响应式依赖</p>
            <p>❌ 无法获取 oldValue</p>
            <p>⚠️ 依赖范围不直观，小心陷阱</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header>③ deep watch 与 getter</template>
          <pre class="code-block">{{ deepWatchCode }}</pre>
          <div class="desc-box">
            <p>✅ deep:true 深层监听对象变化</p>
            <p>✅ getter 函数监听对象属性</p>
            <p>⚠️ deep 监听性能开销大</p>
            <p>✅ 推荐用 getter 精确监听</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, watchEffect } from 'vue';

defineOptions({ name: 'WatchCompare' });

const count = ref(0);
const name = ref('初始值');
const obj = reactive({ x: 0, y: 0 });

interface LogItem {
  type: string;
  msg: string;
  time: string;
}
const logs = ref<LogItem[]>([]);

const addLog = (type: string, msg: string) => {
  const time = new Date().toLocaleTimeString();
  logs.value.unshift({ type, msg, time });
  if (logs.value.length > 30) logs.value.pop();
};

const clearLogs = () => { logs.value = []; };

// ① watch — 惰性，明确监听源
watch(count, (newVal, oldVal) => {
  addLog('watch', `count 变化：${oldVal} → ${newVal}`);
});

// watch 多个源
watch([count, name], ([newCount, newName], [oldCount, oldName]) => {
  addLog('watch-multi', `多源变化：count=${newCount}(旧${oldCount}), name="${newName}"(旧"${oldName}")`);
});

// ② watchEffect — 立即执行，自动追踪依赖
watchEffect(() => {
  // 自动追踪了 count 和 name 的依赖
  addLog('watchEffect', `自动追踪触发：count=${count.value}, name="${name.value}"`);
});

// ③ deep watch
watch(obj, (newObj) => {
  addLog('watch-deep', `obj 深层变化：x=${newObj.x}, y=${newObj.y}`);
}, { deep: true });

// getter 精确监听
watch(() => obj.x, (newX, oldX) => {
  addLog('watch-getter', `obj.x 变化：${oldX} → ${newX}`);
});

const watchCode = `watch(count, (newVal, oldVal) => {
  console.log(newVal, oldVal)
})

// 多个源
watch([a, b], ([na, nb]) => { ... })

// 立即执行
watch(count, handler, { immediate: true })`;

const watchEffectCode = `// 立即执行，自动追踪 fn 内的依赖
watchEffect(() => {
  // 自动追踪 count 和 name
  console.log(count.value, name.value)
})

// 清理副作用
watchEffect((onCleanup) => {
  const timer = setInterval(fn, 1000)
  onCleanup(() => clearInterval(timer))
})`;

const deepWatchCode = `// 深层监听对象（性能开销大）
watch(obj, handler, { deep: true })

// 推荐：用 getter 精确监听某个属性
watch(() => obj.x, (newX, oldX) => {
  // 只有 obj.x 变化时触发
})

// watchSyncEffect：同步触发（慎用）
watchSyncEffect(() => {
  // 在 DOM 更新之前同步运行
})`;
</script>

<style lang="less" scoped>
.watch-compare-page {
  padding: 20px;
  overflow-y: auto;
}

.ctrl-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.log-panel {
  max-height: 280px;
  overflow-y: auto;
}

.log-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;

  &.watch { background: #f0f9ff; }
  &.watch-multi { background: #fff7e6; }
  &.watchEffect { background: #f6ffed; }
  &.watch-deep { background: #fff0f6; }
  &.watch-getter { background: #f9f0ff; }

  .log-badge {
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 11px;
    background: rgba(0,0,0,0.06);
    min-width: 80px;
    text-align: center;
    flex-shrink: 0;
  }

  .log-msg {
    flex: 1;
    color: #303133;
  }

  .log-time {
    color: #999;
    font-size: 11px;
    flex-shrink: 0;
  }
}

.code-block {
  background: #1e1e2e;
  color: #cdd6f4;
  border-radius: 8px;
  padding: 12px;
  font-size: 11px;
  line-height: 1.7;
  overflow-x: auto;
  white-space: pre;
}

.desc-box {
  margin-top: 12px;
  p {
    font-size: 12px;
    line-height: 1.8;
    color: #555;
  }
}
</style>
