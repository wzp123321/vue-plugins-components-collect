<!--
 * MapToolbar.vue — 顶部居中「视角 / 巡游 / 工具」快捷栏
 * 职责：把"视角预设、自动巡游、全屏、截图、帮助"这类动作型控制集中成一行，
 *   与右上角"数据参数"控制台（MapControlPanel）分工：那边调数据，这边调镜头与工具。
 * 角色：纯 UI；通过事件 / v-model 把动作转交 ChinaMap3D（它才持有 viewport）。
 * 协作：ChinaMap3D（消费本组件的 emit 与 roam 双向绑定）。
 -->
<template>
  <div class="map-toolbar">
    <!-- 视角预设：俯视 / 斜视 / 正前 -->
    <div class="map-toolbar__seg">
      <button
        v-for="v in views"
        :key="v.name"
        type="button"
        class="map-toolbar__segBtn"
        :class="{ 'map-toolbar__segBtn--on': current === v.name }"
        :title="v.title"
        @click="selectView(v.name)"
      >
        {{ v.label }}
      </button>
    </div>

    <span class="map-toolbar__divider"></span>

    <!-- 自动巡游：绕地图法线缓慢自转 -->
    <label class="map-toolbar__toggle" :title="roam ? '停止巡游' : '开始巡游'">
      <input type="checkbox" :checked="roam" @change="onRoam($event)" />
      <span class="map-toolbar__track"></span>
      <span class="map-toolbar__toggleText">巡游</span>
    </label>

    <span class="map-toolbar__divider"></span>

    <!-- 工具按钮：全屏 / 截图 / 帮助 -->
    <button type="button" class="map-toolbar__btn" title="全屏切换" @click="emit('fullscreen')">⛶</button>
    <button type="button" class="map-toolbar__btn" title="截图保存 PNG" @click="emit('screenshot')">📷</button>
    <button type="button" class="map-toolbar__btn" title="快捷键帮助 (F1)" @click="emit('help')">?</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    /** 自动巡游开关（v-model:roam 双向绑定） */
    roam?: boolean
    /** 当前视角预设（高亮用，由外部回写） */
    current?: 'top' | 'oblique' | 'front'
  }>(),
  { roam: false, current: 'oblique' },
)

const emit = defineEmits<{
  (e: 'view', name: 'top' | 'oblique' | 'front'): void
  (e: 'update:roam', value: boolean): void
  (e: 'fullscreen'): void
  (e: 'screenshot'): void
  (e: 'help'): void
}>()

const views = [
  { name: 'top' as const, label: '俯视', title: '正俯视（看全国轮廓与配色）' },
  { name: 'oblique' as const, label: '斜视', title: '默认斜俯视（立体感最强）' },
  { name: 'front' as const, label: '正前', title: '近正前（拉高看柱体竖向对比）' },
]

const selectView = (name: 'top' | 'oblique' | 'front') => emit('view', name)

// 巡游开关：用独立 ref 暂存，避免直接改 props
const localRoam = ref(props.roam)
const onRoam = (event: Event) => {
  const v = (event.target as HTMLInputElement).checked
  localRoam.value = v
  emit('update:roam', v)
}
</script>

<style scoped>
.map-toolbar {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  border-radius: 12px;
  background: rgba(6, 16, 40, 0.78);
  border: 1px solid rgba(95, 216, 255, 0.22);
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 34px rgba(0, 0, 0, 0.45);
  color: #dcefff;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  user-select: none;
}
.map-toolbar__seg {
  display: flex;
  padding: 2px;
  border-radius: 8px;
  background: rgba(120, 150, 180, 0.16);
  border: 1px solid rgba(95, 216, 255, 0.14);
}
.map-toolbar__segBtn {
  padding: 4px 12px;
  border: none;
  border-radius: 6px;
  background: none;
  color: #8fb8d6;
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease;
}
.map-toolbar__segBtn--on {
  background: rgba(47, 192, 255, 0.34);
  color: #eaf6ff;
  box-shadow: 0 0 10px rgba(47, 192, 255, 0.35);
}
.map-toolbar__divider {
  width: 1px;
  height: 18px;
  background: rgba(95, 216, 255, 0.18);
}
.map-toolbar__toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}
.map-toolbar__toggle input { opacity: 0; width: 0; height: 0; }
.map-toolbar__track {
  position: relative;
  width: 34px;
  height: 18px;
  border-radius: 18px;
  background: rgba(120, 150, 180, 0.25);
  border: 1px solid rgba(95, 216, 255, 0.2);
  transition: background 0.2s ease;
}
.map-toolbar__track::before {
  content: '';
  position: absolute;
  left: 3px;
  top: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #9fc4e0;
  transition: transform 0.2s ease, background 0.2s ease;
}
.map-toolbar__toggle input:checked + .map-toolbar__track { background: rgba(47, 192, 255, 0.4); }
.map-toolbar__toggle input:checked + .map-toolbar__track::before {
  transform: translateX(16px);
  background: #eaf6ff;
  box-shadow: 0 0 8px #5fd8ff;
}
.map-toolbar__toggleText { font-size: 12px; color: #7fa8c8; }
.map-toolbar__btn {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid rgba(95, 216, 255, 0.2);
  background: rgba(120, 150, 180, 0.12);
  color: #cfe9ff;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.18s ease, box-shadow 0.18s ease;
}
.map-toolbar__btn:hover {
  background: rgba(47, 192, 255, 0.22);
  box-shadow: 0 0 12px rgba(47, 192, 255, 0.3);
}
</style>
