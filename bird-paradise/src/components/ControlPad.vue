<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import type { SeatIndex } from "../protocol";
import { SEAT_COLORS, SEAT_CONFIG } from "../game/config";
import { useInput } from "../composables/useInput";
import { useGameStore } from "../composables/useGameStore";
import { sfx, unlockAudio } from "../game/audio";

const props = defineProps<{ seat: SeatIndex }>();

const store = useGameStore();
const input = useInput(props.seat);
const leftBtn = ref<HTMLButtonElement | null>(null);
const rightBtn = ref<HTMLButtonElement | null>(null);

const color = computed(() => SEAT_COLORS[props.seat]);
const player = computed(() => store.state.snapshot?.players[props.seat]);
const multiplier = computed(() => input.state.multiplier);
const angleDeg = computed(() =>
  Math.round(((input.state.angle + Math.PI / 2) * 180) / Math.PI),
);

let raf = 0;
let lastSent = "";

function loop(): void {
  if (input.state.left) input.rotate(props.seat, -0.05);
  if (input.state.right) input.rotate(props.seat, 0.05);
  const out = input.build();
  const sig = `${out.angle.toFixed(3)}|${out.multiplier}|${out.firing}`;
  if (sig !== lastSent) {
    store.send(out);
    lastSent = sig;
  }
  raf = requestAnimationFrame(loop);
}

function onPressLeft(down: boolean): void {
  unlockAudio();
  input.setDir(props.seat, down ? "left" : input.state.right ? "right" : null);
}
function onPressRight(down: boolean): void {
  unlockAudio();
  input.setDir(props.seat, down ? "right" : input.state.left ? "left" : null);
}
function onFireDown(): void {
  unlockAudio();
  input.setFiring(props.seat, true);
  sfx.fire();
}
function onFireUp(): void {
  input.setFiring(props.seat, false);
}
function onMult(delta: number): void {
  unlockAudio();
  input.bumpMultiplier(props.seat, delta);
}

onMounted(() => {
  raf = requestAnimationFrame(loop);
});
onBeforeUnmount(() => {
  cancelAnimationFrame(raf);
});

function onKey(e: KeyboardEvent): void {
  if (e.repeat) return;
  if (e.code === "KeyA" || e.code === "ArrowLeft")
    input.setDir(props.seat, "left");
  if (e.code === "KeyD" || e.code === "ArrowRight")
    input.setDir(props.seat, "right");
  if (e.code === "Space") {
    e.preventDefault();
    input.setFiring(props.seat, true);
    sfx.fire();
  }
  if (e.code === "KeyZ") input.bumpMultiplier(props.seat, -100);
  if (e.code === "KeyX") input.bumpMultiplier(props.seat, 100);
}
function onKeyUp(e: KeyboardEvent): void {
  if (e.code === "KeyA" || e.code === "ArrowLeft") onPressLeft(false);
  if (e.code === "KeyD" || e.code === "ArrowRight") onPressRight(false);
  if (e.code === "Space") onFireUp();
}

onMounted(() => {
  window.addEventListener("keydown", onKey);
  window.addEventListener("keyup", onKeyUp);
});
onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKey);
  window.removeEventListener("keyup", onKeyUp);
});
</script>

<template>
  <div class="pad" :style="{ borderColor: color }" v-if="player">
    <div class="row dir">
      <button
        ref="leftBtn"
        class="btn"
        @pointerdown="onPressLeft(true)"
        @pointerup="onPressLeft(false)"
        @pointercancel="onPressLeft(false)"
        @pointerleave="onPressLeft(false)"
        aria-label="向左"
      >
        ◀
      </button>
      <button
        ref="fireBtn"
        class="btn fire"
        :style="{ background: color }"
        @pointerdown="onFireDown"
        @pointerup="onFireUp"
        @pointercancel="onFireUp"
        @pointerleave="onFireUp"
        aria-label="射击"
      >
        射
      </button>
      <button
        ref="rightBtn"
        class="btn"
        @pointerdown="onPressRight(true)"
        @pointerup="onPressRight(false)"
        @pointercancel="onPressRight(false)"
        @pointerleave="onPressRight(false)"
        aria-label="向右"
      >
        ▶
      </button>
    </div>
    <div class="row mult">
      <button
        class="btn sm"
        @click="onMult(-100)"
        :disabled="multiplier <= SEAT_CONFIG.multiplierMin"
      >
        －
      </button>
      <div class="mult-val" :style="{ color }">
        <span class="lab">倍数</span>
        <span class="num">x{{ multiplier }}</span>
      </div>
      <button
        class="btn sm"
        @click="onMult(100)"
        :disabled="multiplier >= SEAT_CONFIG.multiplierMax"
      >
        ＋
      </button>
    </div>
    <div class="hint">
      P{{ props.seat + 1 }} · {{ player.name }} · 角度 {{ angleDeg }}°
    </div>
  </div>
</template>

<style scoped>
.pad {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.55);
  border: 2px solid;
  border-radius: 12px;
  color: #fff;
  width: 220px;
  user-select: none;
  -webkit-user-select: none;
}
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}
.btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-size: 22px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: none;
}
.btn:active {
  background: rgba(255, 255, 255, 0.3);
}
.btn.fire {
  width: 70px;
  height: 70px;
  font-size: 18px;
  background: #ff5b6e;
  box-shadow: 0 0 16px rgba(255, 91, 110, 0.6);
}
.btn.sm {
  width: 36px;
  height: 36px;
  font-size: 18px;
  border-radius: 8px;
}
.btn:disabled {
  opacity: 0.3;
}
.mult-val {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-weight: 700;
}
.mult-val .lab {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
}
.mult-val .num {
  font-size: 18px;
}
.hint {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
}
</style>
