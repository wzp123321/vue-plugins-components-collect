<script setup lang="ts">
import { ref } from 'vue'
import type { SeatIndex } from '../protocol'

const props = defineProps<{
  joining: boolean
  error: string | null
}>()

const emit = defineEmits<{
  join: [data: { roomId: string; name: string; preferredSeat: SeatIndex | null }]
}>()

const roomId = ref('room1')
const name = ref('玩家' + Math.floor(Math.random() * 100))
const preferredSeat = ref<SeatIndex | null>(null)

function submit(): void {
  if (!roomId.value.trim() || !name.value.trim()) return
  emit('join', {
    roomId: roomId.value.trim(),
    name: name.value.trim(),
    preferredSeat: preferredSeat.value
  })
}
</script>

<template>
  <div class="lobby">
    <div class="card">
      <h1 class="title">飞鸟乐园</h1>
      <p class="subtitle">4 人联机 · 方向键 + 射击 + 倍数递增</p>
      <form class="form" @submit.prevent="submit">
        <label class="field">
          <span>昵称</span>
          <input v-model="name" maxlength="8" placeholder="你的昵称" required />
        </label>
        <label class="field">
          <span>房间号</span>
          <input v-model="roomId" maxlength="16" placeholder="输入房间号" required />
        </label>
        <label class="field">
          <span>座位（可选）</span>
          <div class="seat-pick">
            <button
              v-for="i in [0,1,2,3]"
              :key="i"
              type="button"
              class="seat-btn"
              :class="{ active: preferredSeat === i - 1 }"
              :data-seat="i - 1"
              @click="preferredSeat = preferredSeat === i - 1 ? null : (i - 1) as SeatIndex"
            >P{{ i }}</button>
          </div>
        </label>
        <button type="submit" class="join-btn" :disabled="props.joining">
          {{ props.joining ? '连接中…' : '进入游戏' }}
        </button>
        <p v-if="props.error" class="err">{{ props.error }}</p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.lobby {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 50% 40%, #2a4f7a, #06121f);
}
.card {
  width: min(90vw, 360px);
  padding: 28px 24px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  color: #fff;
}
.title {
  margin: 0 0 4px;
  font-size: 28px;
  text-align: center;
  letter-spacing: 4px;
}
.subtitle {
  margin: 0 0 20px;
  text-align: center;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}
.form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}
.field input {
  height: 40px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.25);
  color: #fff;
  font: inherit;
}
.field input:focus {
  outline: 2px solid #36c1ff;
  border-color: transparent;
}
.seat-pick {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.seat-btn {
  height: 40px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.25);
  color: #fff;
}
.seat-btn.active {
  background: #36c1ff;
  color: #00192b;
  font-weight: 700;
}
.join-btn {
  height: 46px;
  border-radius: 8px;
  background: linear-gradient(90deg, #ff5b6e, #36c1ff);
  color: #fff;
  font-weight: 700;
  font-size: 16px;
  margin-top: 4px;
}
.join-btn:disabled {
  opacity: 0.5;
}
.err {
  margin: 4px 0 0;
  text-align: center;
  color: #ff8a3d;
  font-size: 13px;
}
</style>
