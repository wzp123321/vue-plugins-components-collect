<script setup lang="ts">
import { ref } from "vue";
import type { SeatIndex } from "@bird-paradise/shared";

const props = defineProps<{
  joining: boolean;
  error: string | null;
}>();

const emit = defineEmits<{
  join: [
    data: { roomId: string; name: string; preferredSeat: SeatIndex | null },
  ];
}>();

const roomId = ref("room1");
const name = ref("玩家" + Math.floor(Math.random() * 100));
const preferredSeat = ref<SeatIndex | null>(null);

function submit(): void {
  if (!roomId.value.trim() || !name.value.trim()) return;
  emit("join", {
    roomId: roomId.value.trim(),
    name: name.value.trim(),
    preferredSeat: preferredSeat.value,
  });
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
          <input
            v-model="roomId"
            maxlength="16"
            placeholder="输入房间号"
            required
          />
        </label>
        <label class="field">
          <span>座位（可选）</span>
          <div class="seat-pick">
            <button
              v-for="i in [0, 1, 2, 3]"
              :key="i"
              type="button"
              class="seat-btn"
              :class="{ active: preferredSeat === i }"
              :data-seat="i"
              @click="
                preferredSeat = preferredSeat === i ? null : (i as SeatIndex)
              "
            >
              P{{ i + 1 }}
            </button>
          </div>
        </label>
        <button type="submit" class="join-btn" :disabled="props.joining">
          {{ props.joining ? "连接中…" : "进入游戏" }}
        </button>
        <p v-if="props.error" class="err">{{ props.error }}</p>
      </form>
    </div>

    <details class="help">
      <summary>操作说明</summary>
      <div class="help-body">
        <p class="help-goal">
          4 人联机 · 屏幕底部 4 个炮台朝上打飞鸟，按键即可开火。
        </p>

        <div class="help-cols">
          <section>
            <h3>键盘（PC）</h3>
            <ul class="keys">
              <li><kbd>A</kbd> / <kbd>←</kbd><span>炮台向左</span></li>
              <li><kbd>D</kbd> / <kbd>→</kbd><span>炮台向右</span></li>
              <li><kbd>Space</kbd><span>射击（按住连发）</span></li>
              <li><kbd>Z</kbd><span>倍数 -100</span></li>
              <li><kbd>X</kbd><span>倍数 +100</span></li>
            </ul>
          </section>

          <section>
            <h3>触屏（手机/平板）</h3>
            <ul class="keys">
              <li><span class="ic">◀ ▶</span><span>左右转向</span></li>
              <li><span class="ic">射</span><span>按住射击</span></li>
              <li>
                <span class="ic">－ ＋</span><span>调整倍数（100~2000）</span>
              </li>
            </ul>
          </section>
        </div>

        <p class="help-tip">
          倍数越高伤害越大但消耗越多；同一只鸟被快速连击会触发连击加成。
        </p>
      </div>
    </details>
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

/* —— 操作说明 —— */
.help {
  position: fixed;
  left: 12px;
  bottom: 12px;
  width: min(92vw, 360px);
  padding: 10px 14px;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 12px;
  backdrop-filter: blur(8px);
}
.help > summary {
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  list-style: none;
  outline: none;
  user-select: none;
}
.help > summary::before {
  content: "▸";
  display: inline-block;
  margin-right: 6px;
  transition: transform 0.15s;
}
.help[open] > summary::before {
  transform: rotate(90deg);
}
.help-body {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.help-goal {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}
.help-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.help-cols h3 {
  margin: 0 0 6px;
  font-size: 12px;
  letter-spacing: 1px;
  color: #36c1ff;
}
.keys {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.keys li {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
}
.keys span {
  color: rgba(255, 255, 255, 0.8);
}
kbd {
  display: inline-block;
  min-width: 18px;
  padding: 1px 6px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 4px;
  font:
    11px/1.4 ui-monospace,
    "Cascadia Mono",
    "Consolas",
    monospace;
  text-align: center;
  color: #fff;
}
.ic {
  display: inline-block;
  min-width: 28px;
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 4px;
  font-size: 11px;
  text-align: center;
  color: #fff;
}
.help-tip {
  margin: 0;
  padding-top: 8px;
  border-top: 1px dashed rgba(255, 255, 255, 0.15);
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}
@media (max-width: 420px) {
  .help-cols {
    grid-template-columns: 1fr;
  }
}
</style>
