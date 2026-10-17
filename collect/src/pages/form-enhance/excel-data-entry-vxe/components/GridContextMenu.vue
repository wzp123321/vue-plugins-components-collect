<script setup lang="ts">
// 右键上下文菜单（网格内右键唤出）：复制 / 粘贴 / 插入行 / 清空 / 删除本行
import type { GridMouse } from '../hooks/useGridMouse';

defineOptions({ name: 'GridContextMenu' });
const props = defineProps<{ mouse: GridMouse }>();

const { menu, menuAct } = props.mouse;
</script>

<template>
  <div v-if="menu.show" class="dt-menu" :style="menu.style" @contextmenu.prevent>
    <div class="dt-menu-item" @click="menuAct('copy')">📋 复制</div>
    <div class="dt-menu-item" @click="menuAct('paste')">📥 粘贴</div>
    <div class="dt-menu-sep" />
    <div class="dt-menu-item" @click="menuAct('insertUp')">⬆ 在上方插入行</div>
    <div class="dt-menu-item" @click="menuAct('insertDown')">⬇ 在下方插入行</div>
    <div class="dt-menu-item" @click="menuAct('clear')">🧹 清空内容</div>
    <div class="dt-menu-item danger" @click="menuAct('deleteRow')">🗑 删除本行</div>
  </div>
</template>

<style scoped>
.dt-menu {
  position: fixed;
  z-index: 9999;
  min-width: 150px;
  background: var(--dt-panel);
  border: 1px solid var(--dt-border);
  border-radius: 10px;
  padding: 6px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
}
html.dark .dt-menu {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}
.dt-menu-item {
  padding: 8px 10px;
  border-radius: 7px;
  font-size: 13px;
  color: var(--dt-text);
  cursor: pointer;
}
.dt-menu-item:hover {
  background: var(--dt-hover);
}
.dt-menu-item.danger {
  color: var(--dt-danger);
}
.dt-menu-sep {
  height: 1px;
  background: var(--dt-border);
  margin: 4px 0;
}
</style>
