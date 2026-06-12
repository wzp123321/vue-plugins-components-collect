<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useGameStore } from "../composables/useGameStore";
import { render } from "../game/render";
import { STAGE } from "../game/config";

const store = useGameStore();
const canvasRef = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;
let raf = 0;

function resize(): void {
  const c = canvasRef.value;
  if (!c) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  c.width = STAGE.width * dpr;
  c.height = STAGE.height * dpr;
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function loop(): void {
  const snap = store.state.snapshot;
  if (ctx && snap) {
    render(
      ctx,
      snap as unknown as import("../protocol").WorldSnapshot,
      store.state.flashSeat,
      store.state.selfSeat,
    );
  }
  store.reportFps();
  raf = requestAnimationFrame(loop);
}

onMounted(() => {
  const c = canvasRef.value;
  if (!c) return;
  ctx = c.getContext("2d");
  resize();
  window.addEventListener("resize", resize);
  raf = requestAnimationFrame(loop);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(raf);
  window.removeEventListener("resize", resize);
});

// 监听 selfSeat 变化（座位重新分配）时让 useInput 重置角度
watch(
  () => store.state.selfSeat,
  () => {
    /* 占位，useInput 自己读取 */
  },
);
</script>

<template>
  <div class="canvas-wrap">
    <canvas
      ref="canvasRef"
      class="game-canvas"
      :width="STAGE.width"
      :height="STAGE.height"
    />
    <div
      v-if="store.state.notice"
      class="notice"
      :class="store.state.notice.kind"
    >
      {{ store.state.notice.text }}
    </div>
  </div>
</template>

<style scoped>
.canvas-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #06121f;
}
.game-canvas {
  display: block;
  width: 100%;
  height: 100%;
  max-width: 100vw;
  max-height: 100vh;
  object-fit: contain;
  image-rendering: -webkit-optimize-contrast;
  background: #06121f;
  touch-action: none;
}
.notice {
  position: absolute;
  top: 50px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 18px;
  border-radius: 24px;
  font-weight: 700;
  color: #fff;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 10;
  pointer-events: none;
}
.notice.warn {
  background: rgba(255, 138, 61, 0.7);
}
.notice.error {
  background: rgba(255, 91, 110, 0.7);
}
</style>
