<!--
  MapPerfPanel.vue —— 左上角实时性能读数（FPS / draw call / 三角形数）

  为什么放在页面里而不是依赖 DevTools：DevTools 的 FPS 表在不同 Chrome 版本
  位置不一致（有的版本干脆没有「Frame Rendering Stats」勾选项），而 draw call
  这类数据必须读 renderer.info —— 直接显示在画面上，随手就能对着看。

  FPS 由 requestAnimationFrame 计数得出：本项目每帧都在 rAF 里渲染，两者一致。
  采样窗口 500ms，太频繁的话自身写 DOM 的开销会干扰读数。
-->
<template>
  <div class="map-perf" :class="{ 'map-perf--light': theme === 'light' }" aria-hidden="true">
    <span class="map-perf__fps" :class="{ 'map-perf__fps--warn': fps > 0 && fps < 50 }">
      {{ fps }}
    </span>
    <span class="map-perf__label">FPS</span>
    <i class="map-perf__sep"></i>
    <span>{{ calls }} calls</span>
    <i class="map-perf__sep"></i>
    <span>{{ trisText }} tris</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    /** 跟随地图主题：亮色主题下浮层要转浅，否则深底块会突兀 */
    theme?: 'dark' | 'light';
    /** 取渲染统计；父组件直接把 viewport.stats 挂过来，未就绪时返回 null */
    sample?: () => { calls: number; triangles: number } | null;
  }>(),
  { theme: 'dark' },
);

/** 采样窗口：500ms 一次。再密的话自身写 DOM 的开销会反过来影响读数 */
const SAMPLE_MS = 500;

const fps = ref(0);
const calls = ref(0);
const triangles = ref(0);

let raf = 0;
let frames = 0;
let windowStart = 0;

const tick = () => {
  raf = requestAnimationFrame(tick);
  frames += 1;
  const now = performance.now();
  const span = now - windowStart;
  if (span < SAMPLE_MS) return;
  fps.value = Math.round((frames * 1000) / span);
  const stat = props.sample?.();
  if (stat) {
    calls.value = stat.calls;
    triangles.value = stat.triangles;
  }
  frames = 0;
  windowStart = now;
};

onMounted(() => {
  windowStart = performance.now();
  raf = requestAnimationFrame(tick);
});
onBeforeUnmount(() => cancelAnimationFrame(raf));

/** 三角形数上万后只显示整数 k，省得数字跳来跳去 */
const trisText = computed(() =>
  triangles.value >= 1000 ? `${Math.round(triangles.value / 1000)}k` : String(triangles.value),
);
</script>

<style scoped lang="less">
.map-perf {
  position: absolute;
  /* 让开左上角的搜索框（.map-search 占 left:16 宽 236 z-index:32）：
     16 + 236 + 16 的间距，贴着它右边排在同一条水平线上 */
  left: 268px;
  top: 16px;
  z-index: 6;
  display: flex;
  align-items: baseline;
  gap: 7px;
  padding: 5px 10px;
  border-radius: 8px;
  background: rgba(6, 16, 30, 0.62);
  border: 1px solid rgba(95, 201, 238, 0.25);
  backdrop-filter: blur(8px);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
  line-height: 1;
  color: rgba(190, 220, 240, 0.72);
  font-variant-numeric: tabular-nums;
  /* 纯读数，不拦鼠标：底下可能还要拖地图 */
  pointer-events: none;
  user-select: none;

  &__fps {
    font-size: 15px;
    font-weight: 500;
    color: #5fd8ff;
  }
  &__fps--warn {
    color: #ffb454;
  }
  &__label {
    font-size: 10px;
    letter-spacing: 0.04em;
    opacity: 0.7;
  }
  &__sep {
    width: 1px;
    height: 10px;
    background: currentColor;
    opacity: 0.22;
    transform: translateY(1px);
  }
}

.map-perf--light {
  background: rgba(255, 255, 255, 0.74);
  border-color: rgba(46, 110, 170, 0.22);
  color: rgba(40, 70, 100, 0.72);

  .map-perf__fps {
    color: #1b6fa8;
  }
  .map-perf__fps--warn {
    color: #b26a00;
  }
}
</style>
