<!--
 * MapHelpDialog.vue — 快捷键 / 交互说明面板（F1 或工具栏「?」唤起）
 * 职责：以面板形式列出 3D 地图的全部交互与快捷键，降低上手成本。
 * 角色：纯展示；visible 由 v-model:visible 控制（外部 F1 / 按钮 / Esc 切换）。
 -->
<template>
  <transition name="help-fade">
    <div v-if="visible" class="map-help" @click.self="close">
      <div class="map-help__panel">
        <div class="map-help__head">
          <span class="map-help__title">交互与快捷键</span>
          <button type="button" class="map-help__close" @click="close">✕</button>
        </div>
        <ul class="map-help__list">
          <li v-for="(item, i) in items" :key="i" class="map-help__row">
            <span class="map-help__keys">{{ item.keys }}</span>
            <span class="map-help__desc">{{ item.desc }}</span>
          </li>
        </ul>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ visible?: boolean }>(), { visible: false })
const emit = defineEmits<{ (e: 'update:visible', value: boolean): void }>()

const items = [
  { keys: '单击', desc: '选中城市（显示标牌）/ 选中板块；点空白处取消选中' },
  { keys: '双击', desc: '下钻到该行政区（省 / 市 / 区）' },
  { keys: '悬停', desc: '高亮板块并显示数据卡片' },
  { keys: '滚轮', desc: '缩放当前层级' },
  { keys: '左键拖拽', desc: '平移地图（上下拖＝远近），或按控制台切为旋转' },
  { keys: '右键拖拽', desc: '绕地图法线旋转' },
  { keys: '右键', desc: '弹出上下文菜单：下钻 / 选中 / 复制代码；点空白出导航操作' },
  { keys: 'Esc', desc: '先关菜单 / 取消选中；若已无选中则返回上一级' },
  { keys: 'Ctrl+Z', desc: '撤销下钻（返回上一级）' },
  { keys: 'Ctrl+Shift+Z', desc: '重做下钻（也可用 Ctrl+Y）' },
  { keys: '空格', desc: '复位视角到当前层默认取景' },
  { keys: '/', desc: '聚焦搜索框，快速定位行政区' },
  { keys: 'Shift+拖拽', desc: '框选多个行政区（按住 Shift 再框可加减选），并自动聚焦选区' },
  { keys: '触屏', desc: '单指点按＝选中、双击＝下钻；双指捏合缩放 / 拖动旋转；拖动手势不会误选中' },
  { keys: '📐 测量', desc: '依次点击地面落点，自动累计折线长度；≥3 点闭合显示面积，可随时清空' },
  { keys: '🔖 书签', desc: '把当前机位（缩放 + 角度 + 平移）存成本地书签，之后一键切回' },
  { keys: 'F1', desc: '打开 / 关闭本帮助面板' },
]

const close = () => emit('update:visible', false)
</script>

<style scoped>
.map-help {
  position: absolute;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(2, 8, 18, 0.55);
  backdrop-filter: blur(2px);
}
.map-help__panel {
  width: 420px;
  max-width: 86%;
  padding: 18px 20px 20px;
  border-radius: 14px;
  background: rgba(6, 16, 40, 0.94);
  border: 1px solid rgba(95, 216, 255, 0.32);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.6), 0 0 26px rgba(47, 192, 255, 0.18);
  color: #dcefff;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
.map-help__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.map-help__title {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #eaf6ff;
  text-shadow: 0 0 10px rgba(54, 224, 255, 0.5);
}
.map-help__close {
  width: 26px;
  height: 26px;
  border-radius: var(--ai-radius-sm);
  border: 1px solid rgba(95, 216, 255, 0.22);
  background: rgba(120, 150, 180, 0.14);
  color: #cfe9ff;
  cursor: pointer;
  font-size: 13px;
}
.map-help__close:hover { background: rgba(47, 192, 255, 0.22); }
.map-help__list { margin: 0; padding: 0; list-style: none; }
.map-help__row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 0;
  border-top: 1px solid rgba(95, 216, 255, 0.1);
}
.map-help__row:first-child { border-top: none; }
.map-help__keys {
  flex: 0 0 84px;
  padding: 2px 8px;
  border-radius: var(--ai-radius-sm);
  background: rgba(47, 192, 255, 0.16);
  color: #bfe9ff;
  font-size: 12px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}
.map-help__desc { flex: 1; font-size: 12px; color: #bcd9f0; line-height: 1.5; }
.help-fade-enter-active,
.help-fade-leave-active { transition: opacity 0.2s ease; }
.help-fade-enter-from,
.help-fade-leave-to { opacity: 0; }
</style>
