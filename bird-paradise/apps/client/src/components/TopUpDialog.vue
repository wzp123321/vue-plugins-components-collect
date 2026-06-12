<script setup lang="ts">
import { computed, ref } from "vue";
import { TOP_UP_OPTIONS, type TopUpOption } from "@bird-paradise/shared";

const props = defineProps<{
  visible: boolean;
  balance: number;
  busy: boolean;
  reason: string | null;
}>();

const emit = defineEmits<{
  close: [];
  confirm: [option: TopUpOption];
}>();

const options = computed(() => TOP_UP_OPTIONS);
const selected = ref<number>(TOP_UP_OPTIONS[1]?.amount ?? 100);

function onConfirm(): void {
  const opt = TOP_UP_OPTIONS.find((o) => o.amount === selected.value);
  if (opt) emit("confirm", opt);
}
</script>

<template>
  <transition name="fade">
    <div v-if="props.visible" class="overlay" @click.self="emit('close')">
      <div class="dialog" role="dialog" aria-label="上币">
        <header>
          <h2>上币</h2>
          <p class="sub">
            当前余额
            <strong :class="{ low: props.balance <= 0 }">{{ props.balance }}</strong>
            币
          </p>
        </header>

        <ul class="options">
          <li
            v-for="o in options"
            :key="o.amount"
            :class="{ active: selected === o.amount }"
            :style="{ '--accent': o.color }"
            @click="selected = o.amount"
          >
            <div class="row1">
              <span class="lab">{{ o.label }}</span>
              <span v-if="o.bonus > 0" class="bonus">+{{ o.bonus }} 赠</span>
            </div>
            <div class="amount">{{ o.amount }} 币</div>
          </li>
        </ul>

        <p v-if="props.reason" class="err">{{ props.reason }}</p>

        <footer>
          <button class="btn cancel" :disabled="props.busy" @click="emit('close')">
            取消
          </button>
          <button class="btn confirm" :disabled="props.busy" @click="onConfirm">
            {{ props.busy ? "充值中…" : "确认充值" }}
          </button>
        </footer>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  backdrop-filter: blur(4px);
}
.dialog {
  width: min(92vw, 360px);
  background: linear-gradient(160deg, #1c3450, #0c1828);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 22px 22px 16px;
  color: #fff;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}
header h2 {
  margin: 0 0 4px;
  font-size: 22px;
  letter-spacing: 2px;
  text-align: center;
}
.sub {
  margin: 0 0 14px;
  text-align: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}
.sub strong {
  color: #ffd24a;
  font-size: 16px;
  font-weight: 700;
  margin: 0 4px;
}
.sub strong.low {
  color: #ff5b6e;
}
.options {
  list-style: none;
  margin: 0 0 10px;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.options li {
  --accent: #36c1ff;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 2px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
}
.options li:hover {
  background: rgba(255, 255, 255, 0.1);
}
.options li.active {
  border-color: var(--accent);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 1px var(--accent) inset, 0 4px 12px rgba(0, 0, 0, 0.4);
}
.row1 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 4px;
}
.lab {
  font-weight: 700;
  color: var(--accent);
}
.bonus {
  background: var(--accent);
  color: #00192b;
  font-weight: 700;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 999px;
}
.amount {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}
.err {
  margin: 4px 0 10px;
  text-align: center;
  color: #ff8a3d;
  font-size: 12px;
}
footer {
  display: flex;
  gap: 10px;
  margin-top: 6px;
}
.btn {
  flex: 1;
  height: 42px;
  border-radius: 8px;
  border: 0;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn.cancel {
  background: rgba(255, 255, 255, 0.1);
}
.btn.confirm {
  background: linear-gradient(90deg, #ff5b6e, #36c1ff);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
