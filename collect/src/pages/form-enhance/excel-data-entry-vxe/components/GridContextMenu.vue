<script setup lang="ts">
// 右键上下文菜单（网格内右键唤出）：复制 / 粘贴 / 清空内容（对齐 Univer 右键语义）
// 本组件只负责把菜单项点击转发给 useGridMouse 暴露的 menuAct 动作；菜单的显隐与定位由 useGridMouse 控制。
// 行与列的增删改统一走工具条与列头单列配置抽屉，右键不提供结构操作。
// 协作：props.mouse(GridMouse) → menu(显隐/定位样式) / menuAct(动作派发)
import type { GridMouse } from '../hooks/useGridMouse';

defineOptions({ name: 'GridContextMenu' });
const props = defineProps<{ mouse: GridMouse }>();

// 解构：menu 控制显隐与 fixed 定位样式；menuAct 派发具体动作（'copy'/'paste'/'clear'）
const { menu, menuAct } = props.mouse;
</script>

<template>
  <!-- position:fixed + 高 z-index：菜单从 gridWrapper 之外弹出，避免被表格遮挡；
       @contextmenu.prevent 阻止默认浏览器右键菜单冒泡
       ⚠️ 必须 Teleport 到 body：外壳 .pcv-wrap 带 backdrop-filter，会成为 fixed 的包含块，
       留在页面内坐标会按 .pcv-wrap 原点二次偏移（右下偏约侧栏宽/header 高），右键菜单点不到目标项。
       ⚠️ Teleport 后不在 .dt-page 内，--dt-* 自定义属性不再继承，故自身挂 .dt-dlg
       （bi-entry.less 里 .dt-dlg 与 .dt-page 映射同一套 --bi-*）。 -->
  <Teleport to="body">
    <div v-if="menu.show" class="dt-menu dt-dlg" :style="menu.style" @contextmenu.prevent>
      <div class="dt-menu-item" @click="menuAct('copy')">📋 复制</div>
      <div class="dt-menu-item" @click="menuAct('paste')">📥 粘贴</div>
      <div class="dt-menu-sep" />
      <div class="dt-menu-item" @click="menuAct('clear')">🧹 清空内容</div>
    </div>
  </Teleport>
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
.dt-menu-sep {
  height: 1px;
  background: var(--dt-border);
  margin: 4px 0;
}
</style>
