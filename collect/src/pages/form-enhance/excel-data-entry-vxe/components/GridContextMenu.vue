<script setup lang="ts">
// 右键上下文菜单（网格内右键唤出）：复制 / 粘贴 / 插入行 / 清空 / 删除本行
// 本组件只负责把菜单项点击转发给 useGridMouse 暴露的 menuAct 动作；菜单的显隐与定位由 useGridMouse 控制。
// 协作：props.mouse(GridMouse) → menu(显隐/定位样式) / menuAct(动作派发)
import type { GridMouse } from '../hooks/useGridMouse';

defineOptions({ name: 'GridContextMenu' });
const props = defineProps<{ mouse: GridMouse }>();

// 解构：menu 控制显隐与 fixed 定位样式；menuAct 派发具体动作（'copy'/'paste'/'insertUp'/'insertDown'/'clear'/'deleteRow'）
const { menu, menuAct } = props.mouse;
</script>

<template>
  <!-- position:fixed + 高 z-index：菜单从 gridWrapper 之外弹出，避免被表格遮挡；
       @contextmenu.prevent 阻止默认浏览器右键菜单冒泡 -->
  <div v-if="menu.show" class="dt-menu" :style="menu.style" @contextmenu.prevent>
    <div class="dt-menu-item" @click="menuAct('copy')">📋 复制</div>
    <div class="dt-menu-item" @click="menuAct('paste')">📥 粘贴</div>
    <div class="dt-menu-sep" />
    <div class="dt-menu-item" @click="menuAct('insertUp')">⬆ 在上方插入行</div>
    <div class="dt-menu-item" @click="menuAct('insertDown')">⬇ 在下方插入行</div>
    <div class="dt-menu-item" @click="menuAct('clear')">🧹 清空内容</div>
    <!-- danger 样式红色强调不可逆操作 -->
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
