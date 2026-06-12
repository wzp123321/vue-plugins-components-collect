<script setup lang="ts">
import { ref, onBeforeUnmount } from "vue";
import Lobby from "./components/Lobby.vue";
import GameView from "./components/GameView.vue";
import TopUpDialog from "./components/TopUpDialog.vue";
import { useGameStore } from "./composables/useGameStore";
import type { SeatIndex, TopUpOption } from "@bird-paradise/shared";
import { sfx, unlockAudio } from "./game/audio";

const store = useGameStore();
const joining = ref(false);
const errMsg = ref<string | null>(null);

/* —— 上币对话框状态 —— */
const topUpVisible = ref(false);
const topUpBusy = ref(false);
const topUpReason = ref<string | null>(null);
const topUpHint = ref<string | null>(null);

function onRequestTopUp(reason: "manual" | "insufficient"): void {
  topUpReason.value = reason === "insufficient" ? "余额不足，请上币" : null;
  topUpHint.value = null;
  topUpVisible.value = true;
}

async function onConfirmTopUp(opt: TopUpOption): Promise<void> {
  if (topUpBusy.value) return;
  topUpBusy.value = true;
  topUpReason.value = null;
  try {
    const r = await store.topUp(opt.amount);
    if (!r.ok) {
      topUpReason.value = r.reason || "上币失败";
    } else {
      topUpHint.value = `充值成功 +${opt.amount}${opt.bonus > 0 ? ` 赠 ${opt.bonus}` : ""}`;
      sfx.join(); // 用加入音效代充成功提示
      setTimeout(() => {
        if (topUpHint.value?.startsWith("充值成功")) topUpHint.value = null;
      }, 1800);
    }
  } finally {
    topUpBusy.value = false;
  }
}

function onCloseTopUp(): void {
  if (topUpBusy.value) return;
  topUpVisible.value = false;
  topUpReason.value = null;
}

async function onJoin(data: {
  roomId: string;
  name: string;
  preferredSeat: SeatIndex | null;
}): Promise<void> {
  unlockAudio();
  joining.value = true;
  errMsg.value = null;
  try {
    const r = await store.join(
      data.roomId,
      data.name,
      data.preferredSeat ?? undefined,
    );
    if (!r.ok) errMsg.value = r.reason || "加入失败";
    else sfx.join();
  } catch (e: unknown) {
    errMsg.value = e instanceof Error ? e.message : "连接失败";
  } finally {
    joining.value = false;
  }
}

function onLeave(): void {
  sfx.leave();
  store.leave();
  topUpVisible.value = false;
}

onBeforeUnmount(() => {
  store.leave();
});
</script>

<template>
  <Lobby
    v-if="!store.state.joined"
    :joining="joining"
    :error="errMsg"
    @join="onJoin"
  />
  <template v-else>
    <GameView @request-top-up="onRequestTopUp" />
    <button class="leave-btn" type="button" @click="onLeave">离开房间</button>

    <!-- 余额/通知 toast -->
    <transition name="toast">
      <div
        v-if="store.state.notice || topUpHint"
        :key="(store.state.notice?.text ?? '') + (topUpHint ?? '')"
        class="toast"
        :class="{
          warn: store.state.notice?.kind === 'warn',
          info: store.state.notice?.kind === 'info' || topUpHint !== null,
        }"
      >
        {{ topUpHint || store.state.notice?.text }}
      </div>
    </transition>

    <TopUpDialog
      :visible="topUpVisible"
      :balance="store.state.selfAccount.balance"
      :busy="topUpBusy"
      :reason="topUpReason"
      @close="onCloseTopUp"
      @confirm="onConfirmTopUp"
    />
  </template>
</template>

<style scoped>
.leave-btn {
  position: fixed;
  top: 6px;
  right: 6px;
  padding: 6px 10px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  font-size: 12px;
  z-index: 20;
}
.toast {
  position: fixed;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-size: 13px;
  border-radius: 999px;
  z-index: 60;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.toast.warn {
  background: rgba(120, 40, 0, 0.85);
  border-color: rgba(255, 140, 60, 0.7);
}
.toast.info {
  background: rgba(0, 80, 60, 0.85);
  border-color: rgba(80, 220, 160, 0.7);
}
.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px);
}
</style>
