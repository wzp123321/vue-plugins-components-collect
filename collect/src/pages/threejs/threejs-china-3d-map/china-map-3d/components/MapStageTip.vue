<template>
  <transition name="stage-fade">
    <div v-if="stage" class="stage-tip" :class="{ 'stage-tip--raised': raised }">
      <span class="stage-tip__spin"></span>
      <span class="stage-tip__text">{{ stage.text }}</span>
      <span class="stage-tip__track">
        <i :style="{ width: `${Math.round(stage.ratio * 100)}%` }"></i>
      </span>
    </div>
  </transition>
</template>

<script setup lang="ts">
defineProps<{
  /** null 表示构建完成，隐藏提示 */
  stage: { text: string; ratio: number } | null
  /** 下钻后底部有返回按钮，进度条需要上移避让 */
  raised?: boolean
}>()
</script>

<style scoped>
.stage-tip {
  position: absolute;
  left: 50%;
  bottom: 26px;
  transform: translateX(-50%);
  transition: bottom 0.25s ease;
  z-index: 40;
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
}
.stage-tip--raised { bottom: 96px; }
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
