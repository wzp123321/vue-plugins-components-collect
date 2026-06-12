<script setup lang="ts">
/**
 * 右上角账户/状态 HUD
 *  - 余额（点击直接弹上币）
 *  - 当前倍数
 *  - 累计充入 / 累计消耗（灰字小提示）
 *  - 余额变化时数字用 pulse 动画提示
 */
import { computed, ref, watch } from "vue";
import type { PlayerAccount, SeatIndex } from "@bird-paradise/shared";
import { COIN, SEAT_COLORS, costOfShot } from "@bird-paradise/shared";

const props = defineProps<{
  seat: SeatIndex;
  account: PlayerAccount;
  multiplier: number;
  visible: boolean;
}>();

const emit = defineEmits<{
  requestTopUp: [];
}>();

const color = computed(() => SEAT_COLORS[props.seat]);
const shotCost = computed(() => costOfShot(props.multiplier));
const shotsLeft = computed(() =>
  shotCost.value > 0 ? Math.floor(props.account.balance / shotCost.value) : 0,
);
const isLow = computed(
  () =>
    props.account.balance > 0 &&
    props.account.balance <= COIN.lowBalanceWarn,
);
const isEmpty = computed(() => props.account.balance <= 0);

// 余额变化时短暂高亮
const flashKey = ref(0);
watch(
  () => props.account.balance,
  () => {
    flashKey.value++;
  },
);
</script>

<template>
  <transition name="hud">
    <div v-if="props.visible" class="hud" :style="{ '--accent': color }">
      <!-- 余额（主信息） -->
      <button
        type="button"
        class="hud-card balance"
        :class="{ low: isLow, empty: isEmpty, flash: flashKey }"
        :key="flashKey"
        @click="emit('requestTopUp')"
        :title="isEmpty ? '余额不足，点击上币' : '点击上币'"
      >
        <span class="ico">
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="url(#g1)"
              stroke="rgba(0,0,0,0.4)"
              stroke-width="1"
            />
            <text
              x="12"
              y="16"
              font-size="11"
              font-weight="900"
              text-anchor="middle"
              fill="#3a2300"
              font-family="system-ui, sans-serif"
            >
              ¢
            </text>
            <defs>
              <radialGradient id="g1" cx="35%" cy="30%" r="80%">
                <stop offset="0%" stop-color="#fff4b8" />
                <stop offset="60%" stop-color="#ffd24a" />
                <stop offset="100%" stop-color="#c97a00" />
              </radialGradient>
            </defs>
          </svg>
        </span>
        <div class="num-block">
          <span class="num">{{ props.account.balance }}</span>
          <span class="lab">余额</span>
        </div>
        <span class="plus">＋</span>
      </button>

      <!-- 倍数 + 剩余可发射次数 -->
      <div class="hud-card small">
        <span class="ico" :style="{ color }">✦</span>
        <div class="num-block">
          <span class="num" :style="{ color }">x{{ props.multiplier }}</span>
          <span class="lab">倍数 · 余 {{ shotsLeft }} 发</span>
        </div>
      </div>

      <!-- 累计 -->
      <div class="hud-card tiny">
        <div class="kv">
          <span class="k">充</span>
          <span class="v">{{ props.account.deposited }}</span>
        </div>
        <div class="kv">
          <span class="k">耗</span>
          <span class="v">{{ props.account.spent }}</span>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.hud {
  position: fixed;
  top: 8px;
  right: 8px;
  z-index: 25;
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 160px;
  font-family: system-ui, -apple-system, sans-serif;
  user-select: none;
}
.hud-card {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background: rgba(8, 16, 26, 0.78);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
}
.hud-card.small {
  padding: 5px 8px;
}
.hud-card.tiny {
  padding: 4px 8px;
  gap: 10px;
  justify-content: space-between;
}
.hud-card .ico {
  font-size: 16px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.num-block {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  line-height: 1.1;
}
.num-block .num {
  font-size: 16px;
  font-weight: 800;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.num-block .lab {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 1px;
}
.hud-card.small .num-block .num {
  font-size: 14px;
}
.plus {
  font-size: 18px;
  font-weight: 900;
  color: var(--accent);
  text-shadow: 0 0 6px var(--accent);
  margin-left: 2px;
}

.hud-card.balance {
  cursor: pointer;
  border: 1px solid color-mix(in srgb, var(--accent) 50%, transparent);
}
.hud-card.balance:hover {
  background: rgba(20, 32, 48, 0.85);
  transform: translateY(-1px);
}
.hud-card.balance:active {
  transform: translateY(0);
}
.hud-card.balance.flash {
  animation: balanceFlash 0.6s ease-out;
}
.hud-card.balance.low {
  border-color: rgba(255, 200, 80, 0.8);
  box-shadow: 0 0 0 1px rgba(255, 200, 80, 0.4) inset,
    0 4px 14px rgba(180, 120, 0, 0.3);
}
.hud-card.balance.low .num-block .num {
  color: #ffd24a;
}
.hud-card.balance.empty {
  border-color: rgba(255, 100, 100, 0.85);
  background: rgba(60, 16, 16, 0.7);
  animation: balanceEmpty 0.9s ease-in-out infinite;
}
.hud-card.balance.empty .num-block .num {
  color: #ff8a8a;
}

.kv {
  display: flex;
  align-items: baseline;
  gap: 3px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.55);
}
.kv .k {
  font-weight: 700;
}
.kv .v {
  color: rgba(255, 255, 255, 0.85);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

@keyframes balanceFlash {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 var(--accent);
  }
  40% {
    transform: scale(1.08);
    box-shadow: 0 0 14px 2px var(--accent);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
  }
}
@keyframes balanceEmpty {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(255, 100, 100, 0);
  }
  50% {
    box-shadow: 0 0 0 3px rgba(255, 100, 100, 0.5);
  }
}
.hud-enter-active,
.hud-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.hud-enter-from,
.hud-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
