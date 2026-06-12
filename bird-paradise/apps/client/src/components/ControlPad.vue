<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import type { SeatIndex } from "@bird-paradise/shared";
import {
  COIN,
  SEAT_COLORS,
  SEAT_CONFIG,
  costOfShot,
} from "@bird-paradise/shared";
import { useInput } from "../composables/useInput";
import { useGameStore } from "../composables/useGameStore";
import { sfx, unlockAudio } from "../game/audio";

const props = defineProps<{ seat: SeatIndex }>();
const emit = defineEmits<{
  /** 余额不足 / 用户主动点 “上币” 按钮时请求打开上币面板 */
  requestTopUp: [reason: "manual" | "insufficient"];
}>();

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
const balance = computed(() => store.state.selfAccount.balance);
const cost = computed(() => costOfShot(multiplier.value));
const canFire = computed(() => balance.value >= cost.value);
const isLowBalance = computed(
  () => balance.value > 0 && balance.value <= COIN.lowBalanceWarn,
);
const noBalance = computed(() => balance.value <= 0);

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
  if (!canFire.value) {
    emit("requestTopUp", "insufficient");
    return;
  }
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
    if (!canFire.value) {
      emit("requestTopUp", "insufficient");
      return;
    }
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
        :class="{ disabled: !canFire, low: isLowBalance, empty: noBalance }"
        :style="{ background: canFire ? color : 'rgba(80,80,80,0.6)' }"
        @pointerdown="onFireDown"
        @pointerup="onFireUp"
        @pointercancel="onFireUp"
        @pointerleave="onFireUp"
        :aria-label="canFire ? '射击' : '余额不足，请上币'"
        :title="canFire ? '射击' : '余额不足，请上币'"
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
    <div class="row coin" :class="{ low: isLowBalance, empty: noBalance }">
      <div class="coin-info">
        <span class="coin-ico" :style="{ color }">◉</span>
        <span class="coin-lab">余额</span>
        <span class="coin-num">{{ balance }}</span>
        <span class="coin-cost">
          / 弹 <strong>{{ cost }}</strong>
        </span>
      </div>
      <button
        class="btn topup"
        :class="{ pulse: isLowBalance || noBalance }"
        type="button"
        @click="emit('requestTopUp', 'manual')"
      >
        上币
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
  border: 0;
  cursor: pointer;
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
  transition:
    box-shadow 0.15s,
    background 0.15s,
    transform 0.1s;
}
.btn.fire.disabled {
  box-shadow: none;
  filter: grayscale(0.6);
}
.btn.fire.low {
  animation: fireWarnPulse 0.8s ease-in-out infinite;
}
.btn.fire.empty {
  animation: fireWarnPulse 0.6s ease-in-out infinite;
  background: rgba(180, 60, 60, 0.5) !important;
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
.row.coin {
  background: rgba(0, 0, 0, 0.35);
  border-radius: 8px;
  padding: 6px 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.row.coin.low {
  border-color: rgba(255, 200, 80, 0.6);
  background: rgba(80, 50, 0, 0.35);
}
.row.coin.empty {
  border-color: rgba(255, 100, 100, 0.7);
  background: rgba(80, 20, 20, 0.45);
  animation: coinRowWarn 0.8s ease-in-out infinite;
}
.coin-info {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 700;
}
.coin-ico {
  font-size: 14px;
  text-shadow: 0 0 6px currentColor;
}
.coin-lab {
  color: rgba(255, 255, 255, 0.6);
  font-weight: 400;
  font-size: 11px;
}
.coin-num {
  font-size: 16px;
  color: #fff;
}
.row.coin.low .coin-num {
  color: #ffd24a;
}
.row.coin.empty .coin-num {
  color: #ff6b6b;
}
.coin-cost {
  margin-left: 4px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.55);
  font-weight: 400;
}
.coin-cost strong {
  color: #fff;
  font-weight: 700;
}
.btn.topup {
  width: 60px;
  height: 30px;
  border-radius: 999px;
  font-size: 12px;
  background: linear-gradient(90deg, #ffd24a, #ff8a3d);
  color: #1a0e00;
  font-weight: 800;
  letter-spacing: 1px;
  box-shadow: 0 0 10px rgba(255, 210, 74, 0.45);
}
.btn.topup.pulse {
  animation: topupPulse 1.1s ease-in-out infinite;
}
.hint {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
}
@keyframes fireWarnPulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}
@keyframes coinRowWarn {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(255, 100, 100, 0);
  }
  50% {
    box-shadow: 0 0 0 3px rgba(255, 100, 100, 0.4);
  }
}
@keyframes topupPulse {
  0%,
  100% {
    box-shadow: 0 0 10px rgba(255, 210, 74, 0.45);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 18px rgba(255, 210, 74, 0.85);
    transform: scale(1.04);
  }
}
</style>
