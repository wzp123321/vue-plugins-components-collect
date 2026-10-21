<!--
 * MapControlPanel.vue — 右上角「可视化控制台」
 * 职责：把地图的可视化参数以 v-model 双向绑定下发到 ChinaMap3D。
 *   - 左键拖拽模式：pan（平移）/ rotate（旋转）
 *   - 数据柱：开关 + 高值色（关闭即切换为地理标牌）
 *   - 飞线：开关 + 颜色 + 速度
 * 角色：纯 UI 面板，不含任何 Three.js 逻辑；通过 defineModel 与 ChinaMap3D
 *   的对应 props 一一映射。collapsed 仅控制本面板自身的折叠展开。
 * 协作：threejs-china-3d-map.vue（作为 v-model 数据来源）。
 -->
<template>
  <div class="map-ctrl" :class="{ 'map-ctrl--collapsed': collapsed }">
    <div class="map-ctrl__head" @click="collapsed = !collapsed">
      <span class="map-ctrl__pulse"></span>
      <span class="map-ctrl__title">可视化控制台</span>
      <span class="map-ctrl__chev">{{ collapsed ? '▸' : '▾' }}</span>
    </div>
    <div v-show="!collapsed" class="map-ctrl__body">
      <!-- 拖拽行为 -->
      <div class="map-ctrl__group">
        <div class="map-ctrl__groupHead">
          <span class="map-ctrl__groupTitle">左键拖拽</span>
        </div>
        <div class="map-ctrl__seg">
          <button
            type="button"
            class="map-ctrl__segBtn"
            :class="{ 'map-ctrl__segBtn--on': dragMode === 'pan' }"
            @click="dragMode = 'pan'"
          >
            平移
          </button>
          <button
            type="button"
            class="map-ctrl__segBtn"
            :class="{ 'map-ctrl__segBtn--on': dragMode === 'rotate' }"
            @click="dragMode = 'rotate'"
          >
            旋转
          </button>
        </div>
        <div class="map-ctrl__note">
          {{
            dragMode === 'pan'
              ? '左键拖着地图走（上下拖＝远近）· 右键旋转 · 滚轮缩放'
              : '左键旋转 · 右键拖着地图走 · 滚轮缩放'
          }}
        </div>
      </div>
      <!-- 主题 -->
      <div class="map-ctrl__group">
        <div class="map-ctrl__groupHead">
          <span class="map-ctrl__groupTitle">主题</span>
        </div>
        <div class="map-ctrl__seg">
          <button
            type="button"
            class="map-ctrl__segBtn"
            :class="{ 'map-ctrl__segBtn--on': theme === 'dark' }"
            @click="theme = 'dark'"
          >
            暗色
          </button>
          <button
            type="button"
            class="map-ctrl__segBtn"
            :class="{ 'map-ctrl__segBtn--on': theme === 'light' }"
            @click="theme = 'light'"
          >
            亮色
          </button>
        </div>
        <div class="map-ctrl__note">切换板块底色/侧壁/描边配色，可随时切回</div>
      </div>
      <!-- 立体 / 平面：压薄板块厚度，便于读 choropleth / 标牌 -->
      <div class="map-ctrl__group">
        <div class="map-ctrl__groupHead">
          <span class="map-ctrl__groupTitle">立体 / 平面</span>
        </div>
        <div class="map-ctrl__seg">
          <button
            type="button"
            class="map-ctrl__segBtn"
            :class="{ 'map-ctrl__segBtn--on': !flat }"
            @click="flat = false"
          >
            立体
          </button>
          <button
            type="button"
            class="map-ctrl__segBtn"
            :class="{ 'map-ctrl__segBtn--on': flat }"
            @click="flat = true"
          >
            平面
          </button>
        </div>
        <div class="map-ctrl__note">平面模式压薄板块，读数据更清晰（切换会重建几何）</div>
      </div>
      <!-- 地图背景：A 大屏底图（2D 贴屏幕）/ B 三维底板（3D 随视角透视），可独立开关也可叠加 -->
      <div class="map-ctrl__group">
        <div class="map-ctrl__groupHead">
          <span class="map-ctrl__groupTitle">地图背景</span>
        </div>
        <div class="map-ctrl__row">
          <span class="map-ctrl__label map-ctrl__label--wide">大屏底图</span>
          <label class="map-ctrl__switch">
            <input type="checkbox" v-model="showBgImage" />
            <span class="map-ctrl__track"></span>
          </label>
        </div>
        <div class="map-ctrl__seg map-ctrl__seg--wrap">
          <button
            v-for="item in BG_PRESET_OPTIONS"
            :key="item.value"
            type="button"
            class="map-ctrl__segBtn"
            :class="{ 'map-ctrl__segBtn--on': bgPreset === item.value }"
            @click="bgPreset = item.value"
          >
            {{ item.label }}
          </button>
        </div>
        <div class="map-ctrl__note">预设图均为暗色系，「云图」给亮色主题用</div>
        <div v-show="showBgImage" class="map-ctrl__field map-ctrl__field--slider">
          <span class="map-ctrl__label">强度</span>
          <input class="map-ctrl__range" type="range" v-model.number="bgOpacity" min="0.1" max="1" step="0.05" />
          <span class="map-ctrl__num">{{ Math.round(bgOpacity * 100) }}%</span>
        </div>
        <div class="map-ctrl__row">
          <span class="map-ctrl__label map-ctrl__label--wide">三维底板</span>
          <label class="map-ctrl__switch">
            <input type="checkbox" v-model="showGroundPlane" />
            <span class="map-ctrl__track"></span>
          </label>
        </div>
        <div class="map-ctrl__note">底图贴屏幕、不随视角变；底板在世界坐标里随视角透视</div>
      </div>
      <!-- 数据柱 -->
      <div class="map-ctrl__group">
        <div class="map-ctrl__groupHead">
          <span class="map-ctrl__groupTitle">数据柱</span>
          <label class="map-ctrl__switch">
            <input type="checkbox" v-model="showColumn" />
            <span class="map-ctrl__track"></span>
          </label>
        </div>
        <div v-show="showColumn" class="map-ctrl__field">
          <span class="map-ctrl__label">高值色</span>
          <span class="map-ctrl__swatch" :style="{ background: columnColor }"></span>
          <input class="map-ctrl__color" type="color" v-model="columnColor" />
        </div>
        <div v-show="!showColumn" class="map-ctrl__note">已切换为地理标牌</div>
        <div class="map-ctrl__row">
          <span class="map-ctrl__label map-ctrl__label--wide">板块填色</span>
          <label class="map-ctrl__switch">
            <input type="checkbox" v-model="fillByValue" />
            <span class="map-ctrl__track"></span>
          </label>
        </div>
        <div v-show="fillByValue" class="map-ctrl__note">顶面按数值分档着色，可与数据柱叠加</div>
      </div>
      <!-- 飞线 -->
      <div class="map-ctrl__group">
        <div class="map-ctrl__groupHead">
          <span class="map-ctrl__groupTitle">飞线</span>
          <label class="map-ctrl__switch">
            <input type="checkbox" v-model="showFlyline" />
            <span class="map-ctrl__track"></span>
          </label>
        </div>
        <div v-show="showFlyline" class="map-ctrl__field">
          <span class="map-ctrl__label">颜色</span>
          <span class="map-ctrl__swatch" :style="{ background: flylineColor }"></span>
          <input class="map-ctrl__color" type="color" v-model="flylineColor" />
        </div>
        <div v-show="showFlyline" class="map-ctrl__field map-ctrl__field--slider">
          <span class="map-ctrl__label">速度</span>
          <input class="map-ctrl__range" type="range" v-model.number="flylineSpeed" min="0.05" max="0.8" step="0.01" />
          <span class="map-ctrl__num">{{ flylineSpeed.toFixed(2) }}x</span>
        </div>
      </div>
      <!-- 展示特效 -->
      <div class="map-ctrl__group">
        <div class="map-ctrl__groupHead">
          <span class="map-ctrl__groupTitle">展示特效</span>
        </div>
        <div class="map-ctrl__row">
          <span class="map-ctrl__label">棱锥点位</span>
          <label class="map-ctrl__switch">
            <input type="checkbox" v-model="showPyramid" />
            <span class="map-ctrl__track"></span>
          </label>
        </div>
        <div class="map-ctrl__row">
          <span class="map-ctrl__label">轨道路线</span>
          <label class="map-ctrl__switch">
            <input type="checkbox" v-model="showOrbit" />
            <span class="map-ctrl__track"></span>
          </label>
        </div>
        <div class="map-ctrl__row">
          <span class="map-ctrl__label">高度热力</span>
          <label class="map-ctrl__switch">
            <input type="checkbox" v-model="showHeatmap" />
            <span class="map-ctrl__track"></span>
          </label>
        </div>
        <div class="map-ctrl__row">
          <span class="map-ctrl__label">分档饼图</span>
          <label class="map-ctrl__switch">
            <input type="checkbox" v-model="showPie" />
            <span class="map-ctrl__track"></span>
          </label>
        </div>
        <div class="map-ctrl__row">
          <span class="map-ctrl__label">侧壁流光</span>
          <label class="map-ctrl__switch">
            <input type="checkbox" v-model="showWallScan" />
            <span class="map-ctrl__track"></span>
          </label>
        </div>
        <div class="map-ctrl__row">
          <span class="map-ctrl__label">标签</span>
          <div class="map-ctrl__seg">
            <button
              type="button"
              class="map-ctrl__segBtn"
              :class="{ 'map-ctrl__segBtn--on': labelMode === 'sprite' }"
              @click="labelMode = 'sprite'"
            >
              Sprite
            </button>
            <button
              type="button"
              class="map-ctrl__segBtn"
              :class="{ 'map-ctrl__segBtn--on': labelMode === 'css2d' }"
              @click="labelMode = 'css2d'"
            >
              CSS2D
            </button>
          </div>
        </div>
      </div>
      <!-- 数据聚焦 -->
      <div class="map-ctrl__group">
        <div class="map-ctrl__groupHead">
          <span class="map-ctrl__groupTitle">数据聚焦</span>
        </div>
        <div class="map-ctrl__field map-ctrl__field--slider">
          <span class="map-ctrl__label">阈值</span>
          <input class="map-ctrl__range" type="range" v-model.number="filterThreshold" min="0" max="1" step="0.01" />
          <span class="map-ctrl__num">{{ Math.round(filterThreshold * 100) }}%</span>
        </div>
        <div class="map-ctrl__note">低于阈值的柱体淡出，聚焦重点区域</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// 双向绑定控制参数（与 ChinaMap3D 的 props 一一对应）
const dragMode = defineModel<'pan' | 'rotate'>('dragMode', { default: 'pan' });
// 2D 扁平模式：压薄板块厚度（false=立体 / true=平面）
const flat = defineModel<boolean>('flat', { default: false });
const showColumn = defineModel<boolean>('showColumn', { default: true });
/** 板块填色模式：按数值给行政区顶面着色（与柱体/图例同一套分档） */
const fillByValue = defineModel<boolean>('fillByValue', { default: false });
const columnColor = defineModel<string>('columnColor', { default: '#5FC9EE' });
const showFlyline = defineModel<boolean>('showFlyline', { default: true });
const flylineColor = defineModel<string>('flylineColor', { default: '#7FD4F5' });
const flylineSpeed = defineModel<number>('flylineSpeed', { default: 0.16 });
// 展示型特效开关（与 ChinaMap3D 的对应 props 一一映射）
const showPyramid = defineModel<boolean>('showPyramid', { default: true });
const showOrbit = defineModel<boolean>('showOrbit', { default: true });
const showHeatmap = defineModel<boolean>('showHeatmap', { default: false });
const showPie = defineModel<boolean>('showPie', { default: true });
const showWallScan = defineModel<boolean>('showWallScan', { default: false });
const labelMode = defineModel<'sprite' | 'css2d'>('labelMode', { default: 'sprite' });
const filterThreshold = defineModel<number>('filterThreshold', { default: 0 });
// 主题：暗 / 亮（覆写 mapConfig 配色并重绘板块）
const theme = defineModel<'dark' | 'light'>('theme', { default: 'dark' });
// 地图背景：A 大屏底图（2D）/ B 三维底板（3D），各自独立开关
const showBgImage = defineModel<boolean>('showBgImage', { default: true });
const showGroundPlane = defineModel<boolean>('showGroundPlane', { default: true });
// 大屏底图强度（0~1）：canvas 上的地图/飞线会压暗底图，同开时用它配平观感
const bgOpacity = defineModel<number>('bgOpacity', { default: 1 });

/** 大屏底图预设：builtin=程序化 CSS 渐变，其余对应 assets/backgrounds 下的静态图 */
const BG_PRESET_OPTIONS = [
  { value: 'builtin', label: '内置' },
  { value: 'horizon', label: '网格' },
  { value: 'topo', label: '丝线' },
  { value: 'hex', label: '蜂巢' },
  { value: 'cloud', label: '云图' },
] as const;

const bgPreset = defineModel<(typeof BG_PRESET_OPTIONS)[number]['value']>('bgPreset', {
  default: 'builtin',
});

// 默认收缩：仅以浮动小卡形式悬在右上角，避免遮挡大屏地图；点击标题栏展开/收起。
const collapsed = ref(true);
</script>

<style scoped>
.map-ctrl {
  /* 位置由外部 .china3d-rail（flex 列）决定，这里只管自身尺寸 */
  position: relative;
  flex: 0 0 auto;
  width: 300px;
  /* 高度封顶：分组太多，全展开会顶出屏幕；超出部分由 __body 内部滚动。
     36% 是「一屏能看到 3 个分组」与「给下方两块面板留够高度」的折中。 */
  max-height: 60%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 12px 14px 14px;
  background: rgba(6, 16, 40, 0.78);
  border: 1px solid rgba(95, 216, 255, 0.22);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow:
    0 10px 34px rgba(0, 0, 0, 0.5),
    inset 0 0 0 1px rgba(255, 255, 255, 0.03);
  color: #dcefff;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  user-select: none;
}
.map-ctrl--collapsed {
  /* 折叠时收成一枚贴着右栏的小胶囊，不再固定占满 300 宽 */
  width: auto;
  max-height: none;
}
.map-ctrl__head {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #eaf6ff;
  text-shadow: 0 0 10px rgba(54, 224, 255, 0.5);
}
.map-ctrl__pulse {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #5fd8ff;
  box-shadow: 0 0 8px #5fd8ff;
  animation: map-ctrl-blink 1.6s ease-in-out infinite;
}
@keyframes map-ctrl-blink {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}
.map-ctrl__title {
  flex: 1;
}
.map-ctrl__chev {
  font-size: 12px;
  color: #6f9fc4;
}
/* 内容区：父级限制了高度后，这里成为唯一的滚动容器（标题栏始终可见） */
.map-ctrl__body {
  margin-top: 10px;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-right: 2px;
}
.map-ctrl__body::-webkit-scrollbar {
  width: 4px;
}
.map-ctrl__body::-webkit-scrollbar-thumb {
  background: rgba(95, 216, 255, 0.28);
  border-radius: 2px;
}
.map-ctrl__body::-webkit-scrollbar-track {
  background: transparent;
}
.map-ctrl__group {
  padding: 8px 0;
  border-top: 1px solid rgba(95, 216, 255, 0.12);
}
.map-ctrl__group:first-child {
  border-top: none;
  padding-top: 4px;
}
.map-ctrl__groupHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.map-ctrl__seg {
  display: flex;
  margin-top: 10px;
  padding: 2px;
  border-radius: 8px;
  background: rgba(120, 150, 180, 0.16);
  border: 1px solid rgba(95, 216, 255, 0.14);
}
/* 背景预设 5 个选项，折成两行（3 + 2），避免把面板撑宽 */
.map-ctrl__seg--wrap {
  flex-wrap: wrap;
  gap: 2px;
  margin-top: 8px;
}
.map-ctrl__seg--wrap .map-ctrl__segBtn {
  flex: 1 0 28%;
}
.map-ctrl__segBtn {
  flex: 1;
  padding: 4px 0;
  border: none;
  border-radius: 6px;
  background: none;
  color: #8fb8d6;
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  transition:
    background 0.18s ease,
    color 0.18s ease;
}
.map-ctrl__segBtn--on {
  background: rgba(47, 192, 255, 0.34);
  color: #eaf6ff;
  box-shadow: 0 0 10px rgba(47, 192, 255, 0.35);
}
.map-ctrl__groupTitle {
  font-size: 12px;
  color: #9fc4e0;
  letter-spacing: 0.5px;
}
.map-ctrl__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}
.map-ctrl__field {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}
.map-ctrl__label {
  font-size: 12px;
  color: #7fa8c8;
  width: 32px;
}
/* 四字标签（大屏底图 / 三维底板）：放开定宽，避免折行 */
.map-ctrl__label--wide {
  width: auto;
  white-space: nowrap;
}
.map-ctrl__note {
  margin-top: 8px;
  font-size: 11px;
  color: #6f9fc4;
}
.map-ctrl__swatch {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 0 8px currentColor;
}
.map-ctrl__color {
  flex: 1;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}
.map-ctrl__color::-webkit-color-swatch-wrapper {
  padding: 0;
}
.map-ctrl__color::-webkit-color-swatch {
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 5px;
}
.map-ctrl__field--slider {
  margin-top: 12px;
}
.map-ctrl__range {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  border-radius: 3px;
  background: linear-gradient(90deg, #2fc0ff, #8fe9ff);
  outline: none;
}
.map-ctrl__range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #eaf6ff;
  border: 2px solid #2fc0ff;
  box-shadow: 0 0 8px #2fc0ff;
  cursor: pointer;
}
.map-ctrl__num {
  font-size: 11px;
  color: #8fe9ff;
  width: 40px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/* 开关 */
.map-ctrl__switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
  cursor: pointer;
}
.map-ctrl__switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.map-ctrl__track {
  position: absolute;
  inset: 0;
  border-radius: 20px;
  background: rgba(120, 150, 180, 0.25);
  border: 1px solid rgba(95, 216, 255, 0.2);
  transition: background 0.2s ease;
}
.map-ctrl__track::before {
  content: '';
  position: absolute;
  left: 3px;
  top: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #9fc4e0;
  transition:
    transform 0.2s ease,
    background 0.2s ease;
}
.map-ctrl__switch input:checked + .map-ctrl__track {
  background: rgba(47, 192, 255, 0.4);
}
.map-ctrl__switch input:checked + .map-ctrl__track::before {
  transform: translateX(20px);
  background: #eaf6ff;
  box-shadow: 0 0 8px #5fd8ff;
}
</style>
