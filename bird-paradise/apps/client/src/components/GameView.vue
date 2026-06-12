<script setup lang="ts">
import { computed } from "vue";
import GameCanvas from "./GameCanvas.vue";
import ControlPad from "./ControlPad.vue";
import StatusHud from "./StatusHud.vue";
import { useGameStore } from "../composables/useGameStore";

const emit = defineEmits<{
  requestTopUp: [reason: "manual" | "insufficient"];
}>();

const store = useGameStore();
const selfSeat = computed(() => store.state.selfSeat);
const selfAccount = computed(() => store.state.selfAccount);
const selfPlayer = computed(() => {
  const i = selfSeat.value;
  if (i === null) return null;
  return store.state.snapshot?.players[i] ?? null;
});
const selfMultiplier = computed(() => selfPlayer.value?.multiplier ?? 100);
</script>

<template>
  <div class="view">
    <GameCanvas class="canvas" />
    <StatusHud
      v-if="selfSeat !== null"
      :seat="selfSeat"
      :account="selfAccount"
      :multiplier="selfMultiplier"
      :visible="true"
      @request-top-up="() => emit('requestTopUp', 'manual')"
    />
    <div v-if="selfSeat !== null" class="pad-area">
      <ControlPad
        :seat="selfSeat"
        @request-top-up="(r) => emit('requestTopUp', r)"
      />
    </div>
  </div>
</template>

<style scoped>
.view {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: #06121f;
}
.canvas {
  flex: 1;
  min-height: 0;
}
.pad-area {
  display: flex;
  justify-content: center;
  padding: 8px 4px 12px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.9));
}
</style>
