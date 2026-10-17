<template>
  <transition name="nav-pop">
    <div v-if="canGoBack" class="map-nav">
      <button class="map-nav__btn" type="button" @click="emit('back')">
        <span class="map-nav__arrow">‹</span>
        <span>返回上级</span>
      </button>
      <div class="map-nav__crumb">{{ crumbText }}</div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  /** 层级路径，最后一项为当前层级 */
  crumbs: Array<{ name: string; count: number }>
}>()

const emit = defineEmits<{ (e: 'back'): void }>()

const canGoBack = computed(() => props.crumbs.length > 1)
const crumbText = computed(() => props.crumbs.map((item) => item.name).join('   ›   '))
</script>

<style scoped>
.map-nav {
  position: absolute;
  left: 50%;
  bottom: 22px;
  transform: translateX(-50%);
  z-index: 35;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.map-nav__btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px 8px 14px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 13px;
  letter-spacing: 1px;
  color: #d8f2ff;
  background: linear-gradient(180deg, rgba(22, 62, 96, 0.92), rgba(8, 26, 48, 0.92));
  border: 1px solid rgba(95, 216, 255, 0.4);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45), 0 0 18px rgba(47, 192, 255, 0.18);
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
  font-family: inherit;
}
.map-nav__btn:hover {
  border-color: rgba(143, 235, 255, 0.85);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.5), 0 0 24px rgba(47, 192, 255, 0.45);
  transform: translateY(-1px);
}
.map-nav__arrow { font-size: 17px; line-height: 1; margin-top: -2px; }
.map-nav__crumb {
  font-size: 11px;
  letter-spacing: 1px;
  color: #7fb4d8;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
}
.nav-pop-enter-active,
.nav-pop-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.nav-pop-enter-from,
.nav-pop-leave-to { opacity: 0; transform: translateX(-50%) translateY(8px); }
</style>
