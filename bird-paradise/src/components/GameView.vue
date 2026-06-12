<script setup lang="ts">
import { computed } from 'vue'
import GameCanvas from './GameCanvas.vue'
import ControlPad from './ControlPad.vue'
import { useGameStore } from '../composables/useGameStore'

const store = useGameStore()
const selfSeat = computed(() => store.state.selfSeat)
</script>

<template>
  <div class="view">
    <GameCanvas class="canvas" />
    <div v-if="selfSeat !== null" class="pad-area">
      <ControlPad :seat="selfSeat" />
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
