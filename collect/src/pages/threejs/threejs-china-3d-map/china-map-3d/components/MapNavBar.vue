<!--
 * MapNavBar.vue — 底部「返回上级 + 面包屑导航」
 * 职责：提供"返回上一级"按钮与可点击的层级面包屑（crumbs）。
 *   - 面包屑最后一项为当前层级，其余可点击跳级（@jump）。
 *   - canGoBack 由 crumbs.length > 1 推导：只有下钻后才出现。
 * 角色：纯 UI；点击通过 emit('back' / 'jump') 交给 ChinaMap3D 处理下钻栈。
 * ⚠️ 架构约定：层级栈 history[] 末尾为当前层，breadcrumb 即其可读投影。
 -->
<template>
  <transition name="nav-pop">
    <div v-if="canGoBack" class="map-nav">
      <button class="map-nav__btn" type="button" @click="emit('back')">
        <span class="map-nav__arrow">‹</span>
        <span>返回上级</span>
      </button>
      <div class="map-nav__crumb">
        <template v-for="(item, index) in crumbs" :key="index">
          <button
            v-if="index < crumbs.length - 1"
            class="map-nav__crumbItem map-nav__crumbItem--link"
            type="button"
            :title="`跳到${item.name}（${item.count} 个下级）`"
            @click="emit('jump', index)"
          >
            {{ item.name }}
          </button>
          <span v-else class="map-nav__crumbItem map-nav__crumbItem--current">{{ item.name }}</span>
          <span v-if="index < crumbs.length - 1" class="map-nav__sep">›</span>
        </template>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  /** 层级路径，最后一项为当前层级 */
  crumbs: Array<{ name: string; count: number }>
}>()

const emit = defineEmits<{
  (e: 'back'): void
  /** 面包屑跳级：直接切到路径上的第 index 层 */
  (e: 'jump', index: number): void
}>()

const canGoBack = computed(() => props.crumbs.length > 1)
</script>

<style scoped>
.map-nav {
  position: absolute;
  /* 与时间轴同一个居中基准（右栏之外的可用区域） */
  left: calc(50% - var(--rail-shift, 0px));
  /* 让开底部时间轴（bottom 18 / 高约 100）：原先 bottom:22 会直接压在时间轴上 */
  bottom: 130px;
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
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  letter-spacing: 1px;
  color: #7fb4d8;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
}
.map-nav__crumbItem {
  padding: 2px 4px;
  font-size: 11px;
  font-family: inherit;
  letter-spacing: 1px;
  color: inherit;
  background: none;
  border: none;
  cursor: default;
}
.map-nav__crumbItem--link {
  cursor: pointer;
  border-radius: 4px;
  transition: color 0.15s ease, background 0.15s ease;
}
.map-nav__crumbItem--link:hover {
  color: #eaf6ff;
  background: rgba(47, 192, 255, 0.16);
  text-shadow: 0 0 10px rgba(54, 224, 255, 0.6);
}
.map-nav__crumbItem--current { color: #bfe9ff; }
.map-nav__sep { color: #4d7ea3; }
.nav-pop-enter-active,
.nav-pop-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.nav-pop-enter-from,
.nav-pop-leave-to { opacity: 0; transform: translateX(-50%) translateY(8px); }
</style>
