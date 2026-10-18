<!--
 * MapStageTip.vue — 底部「构建进度条 / 一次性提示」
 * 职责：展示下钻/加载过程中的进度（stage：文本 + 0~1 比率进度条），以及优先级
 *   更高的一次性提示（notice：info 蓝 / error 红，用于错误、无数据等）。
 * 角色：纯 UI；数据来自 ChinaMap3D 的 stage / notice。raised 为 true 时整体
 *   上移，给底部"返回上级"按钮让位（下钻后才会出现该按钮）。
 -->
<template>
  <div class="stage-host" :class="{ 'stage-host--raised': raised }">
    <transition name="stage-fade">
      <div v-if="stage" class="stage-tip">
        <span class="stage-tip__spin"></span>
        <span class="stage-tip__text">{{ stage.text }}</span>
        <span class="stage-tip__track">
          <i :style="{ width: `${Math.round(stage.ratio * 100)}%` }"></i>
        </span>
      </div>
    </transition>
    <transition name="stage-fade">
      <div v-if="notice" class="stage-tip stage-tip--notice" :class="`stage-tip--${notice.tone}`">
        <span class="stage-tip__mark">{{ notice.tone === 'error' ? '!' : 'i' }}</span>
        <span class="stage-tip__text">{{ notice.text }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  /** null 表示构建完成，隐藏提示 */
  stage: { text: string; ratio: number } | null
  /** 一次性提示（错误 / 无数据），优先级高于进度条 */
  notice?: { text: string; tone: 'info' | 'error' } | null
  /** 下钻后底部有返回按钮，进度条需要上移避让 */
  raised?: boolean
}>()
</script>

<style scoped>
.stage-host {
  position: absolute;
  left: 50%;
  bottom: 26px;
  transform: translateX(-50%);
  transition: bottom 0.25s ease;
  z-index: 40;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  pointer-events: none;
}
.stage-host--raised { bottom: 96px; }

.stage-tip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px 8px 12px;
  border-radius: 999px;
  background: rgba(6, 18, 38, 0.82);
  border: 1px solid rgba(95, 201, 238, 0.22);
  backdrop-filter: blur(8px);
  color: #bfe9ff;
  font-size: 12px;
  letter-spacing: 1px;
  pointer-events: none;
  white-space: nowrap;
}
/* 一次性提示：info 提示色偏蓝，error 偏红 */
.stage-tip--info {
  border-color: rgba(95, 216, 255, 0.45);
  color: #d8f2ff;
}
.stage-tip--error {
  border-color: rgba(255, 122, 122, 0.55);
  color: #ffd9d9;
  background: rgba(48, 10, 18, 0.86);
}
.stage-tip__mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
}
.stage-tip--info .stage-tip__mark {
  color: #04182c;
  background: #5fd8ff;
  box-shadow: 0 0 8px rgba(95, 216, 255, 0.7);
}
.stage-tip--error .stage-tip__mark {
  color: #2a0407;
  background: #ff8a8a;
  box-shadow: 0 0 8px rgba(255, 122, 122, 0.7);
}
.stage-tip__spin {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgba(95, 216, 255, 0.25);
  border-top-color: #5fd8ff;
  animation: stage-spin 0.8s linear infinite;
}
@keyframes stage-spin { to { transform: rotate(360deg); } }
.stage-tip__track {
  width: 96px;
  height: 3px;
  border-radius: 3px;
  overflow: hidden;
  background: rgba(95, 216, 255, 0.15);
}
.stage-tip__track i {
  display: block;
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, #2fa8d8, #9fefff);
  box-shadow: 0 0 8px rgba(95, 216, 255, 0.8);
  transition: width 0.25s ease;
}
.stage-fade-enter-active,
.stage-fade-leave-active { transition: opacity 0.3s ease; }
.stage-fade-enter-from,
.stage-fade-leave-to { opacity: 0; }
</style>
