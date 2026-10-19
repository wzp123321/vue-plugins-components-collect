<!--
 * MapHintFab.vue — 右下角「交互说明」悬浮图标 + 悬浮说明框
 * ---------------------------------------------------------------
 * 职责：把原本常驻右下角的 4 行交互说明收成一个圆形信息图标，鼠标悬浮时弹出
 *   玻璃拟态说明框（移开即收起），把右下角的大块空间让给数据看板。
 * 角色：纯 UI，说明文案自包含；这里只放高频交互速查，完整快捷键列表仍由
 *   F1 / 工具栏「?」唤起的 MapHelpDialog 承担，两者互补不重复。
 * 交互细节：说明框与图标之间有一段空隙，靠面板底部的隐形「桥接区」补上，
 *   避免鼠标从图标移向说明框的途中触发 mouseleave 意外关闭；
 *   键盘 Tab 聚焦 / 点击图标同样可以唤出（触摸场景兜底）。
 * 协作：threejs-china-3d-map.vue（替换原 .china3d-hints 常驻文字块）。
 -->
<template>
  <div class="hint-fab" @mouseenter="open = true" @mouseleave="open = false">
    <button
      type="button"
      class="hint-fab__btn"
      title="悬浮查看交互说明"
      aria-label="交互说明"
      @focus="open = true"
      @blur="open = false"
      @click.stop="open = !open"
    >
      <span class="hint-fab__glyph">i</span>
    </button>
    <transition name="hint-pop">
      <div v-if="open" class="hint-fab__panel">
        <div class="hint-fab__title">交互说明</div>
        <ul class="hint-fab__list">
          <li v-for="(item, i) in items" :key="i" class="hint-fab__item">
            <span class="hint-fab__icon">{{ item.icon }}</span>
            <span class="hint-fab__text">{{ item.text }}</span>
          </li>
        </ul>
        <div class="hint-fab__foot">F1 / 工具栏 ? 查看完整快捷键</div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

/**
 * 高频交互速查（文案承接自原右下角常驻提示，emoji 图标与原文保持一致）。
 * 只保留"看一眼就会用"的四条；更冷门的快捷键走 F1 帮助面板。
 */
const items = [
  { icon: '🖱️', text: '左键拖拽平移（上下拖＝远近）· 右键拖拽旋转 · 滚轮缩放' },
  { icon: '👆', text: '单击城市查看标牌 · 双击区域下钻 · 悬停看数据卡片' },
  { icon: '🔎', text: '左上角搜索当前层级行政区 · 面包屑点击可跳到任意层级' },
  { icon: '⌨️', text: 'Esc 取消选中/返回上级 · 空格复位视角 · / 聚焦搜索' },
];

const open = ref(false);
</script>

<style scoped>
.hint-fab {
  position: absolute;
  right: 20px;
  bottom: 20px;
  z-index: 30;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
.hint-fab__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(95, 216, 255, 0.35);
  background: rgba(6, 16, 40, 0.82);
  backdrop-filter: blur(8px);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.45), 0 0 14px rgba(47, 192, 255, 0.18);
  cursor: help;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}
.hint-fab__btn:hover {
  border-color: rgba(143, 235, 255, 0.8);
  box-shadow: 0 8px 26px rgba(0, 0, 0, 0.5), 0 0 20px rgba(47, 192, 255, 0.45);
  transform: translateY(-1px);
}
.hint-fab__glyph {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 15px;
  font-weight: 800;
  font-style: italic;
  color: #8fe9ff;
  text-shadow: 0 0 8px rgba(95, 216, 255, 0.8);
}
.hint-fab__panel {
  position: absolute;
  right: 0;
  bottom: 46px;
  width: 302px;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(6, 16, 40, 0.94);
  border: 1px solid rgba(95, 216, 255, 0.32);
  backdrop-filter: blur(10px);
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.55), 0 0 22px rgba(47, 192, 255, 0.16);
  color: #dcefff;
  user-select: none;
}
/* 隐形桥接区：补上按钮与面板之间的空隙，鼠标穿行时不触发外层 mouseleave */
.hint-fab__panel::after {
  content: '';
  position: absolute;
  right: 0;
  bottom: -12px;
  width: 48px;
  height: 12px;
}
.hint-fab__title {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #eaf6ff;
  text-shadow: 0 0 10px rgba(54, 224, 255, 0.5);
  margin-bottom: 8px;
}
.hint-fab__list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.hint-fab__item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 5px 0;
  border-top: 1px solid rgba(95, 216, 255, 0.1);
}
.hint-fab__item:first-child {
  border-top: none;
}
.hint-fab__icon {
  flex: 0 0 auto;
  font-size: 12px;
  line-height: 1.6;
}
.hint-fab__text {
  flex: 1;
  font-size: 12px;
  color: #bcd9f0;
  line-height: 1.6;
}
.hint-fab__foot {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed rgba(95, 216, 255, 0.18);
  font-size: 10px;
  letter-spacing: 0.5px;
  color: #6f9fc4;
}
.hint-pop-enter-active,
.hint-pop-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.hint-pop-enter-from,
.hint-pop-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
