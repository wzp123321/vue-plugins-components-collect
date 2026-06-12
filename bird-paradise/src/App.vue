<script setup lang="ts">
import { ref, onBeforeUnmount } from "vue";
import Lobby from "./components/Lobby.vue";
import GameView from "./components/GameView.vue";
import { useGameStore } from "./composables/useGameStore";
import type { SeatIndex } from "./protocol";
import { sfx, unlockAudio } from "./game/audio";

const store = useGameStore();
const joining = ref(false);
const errMsg = ref<string | null>(null);

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
    <GameView />
    <button class="leave-btn" type="button" @click="onLeave">离开房间</button>
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
</style>
