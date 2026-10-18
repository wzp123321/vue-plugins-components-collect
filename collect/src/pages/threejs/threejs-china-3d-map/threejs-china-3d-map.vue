<!--
 * threejs-china-3d-map.vue — Three.js 立体中国地图「页面级入口」
 * ---------------------------------------------------------------
 * 职责：演示页面容器。本身不持有任何 Three.js 逻辑，只负责：
 *   1. 装配主组件 ChinaMap3D（真实 3D 场景所在）；
 *   2. 装配可视化控制台 MapControlPanel，通过 v-model 双向下发控制参数；
 *   3. 生成一份演示用的「项目数」数据 projectData，按省份 adcode 映射数值，
 *      驱动数据柱高度与分级配色。
 * 架构角色：位于本功能的最外层；所有交互/渲染细节都下沉到 ChinaMap3D 及其
 *   composables。这里只做"参数下发 + 演示数据注入"，便于把地图当成一个
 *   可复用的子组件嵌入其它页面。
 * 协作模块：
 *   - ChinaMap3D：3D 地图主组件（核心编排层）
 *   - MapControlPanel：右上角可视化控制台（拖拽模式 / 数据柱 / 飞线）
 -->
<template>
  <div class="china3d-page">
    <ChinaMap3D
      :project-data="projectData"
      :show-column="showColumn"
      :column-color="columnColor"
      :show-flyline="showFlyline"
      :flyline-color="flylineColor"
      :flyline-speed="flylineSpeed"
      :drag-mode="dragMode"
    />
    <MapControlPanel
      v-model:drag-mode="dragMode"
      v-model:show-column="showColumn"
      v-model:column-color="columnColor"
      v-model:show-flyline="showFlyline"
      v-model:flyline-color="flylineColor"
      v-model:flyline-speed="flylineSpeed"
    />
    <div class="china3d-overlay">
      <div class="china3d-title">
        <span class="china3d-title__main">全国数据分布 · 3D 地图</span>
        <span class="china3d-title__sub">Three.js 立体中国地图 · 双击下钻省/市 · 底部按钮返回上级</span>
      </div>
      <div class="china3d-hints">
        <p>🖱️ 左键拖拽平移（上下拖＝远近）· 右键拖拽旋转 · 滚轮缩放</p>
        <p>👆 单击城市查看标牌 · 双击区域下钻 · 悬停看数据卡片</p>
        <p>🔎 左上角搜索当前层级行政区 · 面包屑点击可跳到任意层级</p>
        <p>⌨️ Esc 返回上级 · 空格复位视角 · / 聚焦搜索框</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ChinaMap3D from './china-map-3d/components/ChinaMap3D.vue'
import MapControlPanel from './china-map-3d/components/MapControlPanel.vue'
import chinaGeo from '@/assets/geojson/china.json'

// 可视化控制参数（右上角控制台双向绑定）。这些 ref 即 ChinaMap3D 的 props，
// 通过 v-model 下发；改任意一项都会触发 ChinaMap3D 内对应的 watch 即时生效。
const showColumn = ref(true)
const columnColor = ref('#5FC9EE')
const showFlyline = ref(true)
const flylineColor = ref('#7FD4F5')
const flylineSpeed = ref(0.2)
const dragMode = ref<'pan' | 'rotate'>('pan')

// 演示数据：给每个省份一个随机"项目数"，驱动数据柱高度与配色。
// 真实业务中应替换为后端按 adcode 返回的统计值。
const projectData = ref<Record<number, number>>({})
onMounted(() => {
  const data: Record<number, number> = {}
  for (const feature of (chinaGeo as any).features) {
    const adcode = Number(feature.properties.adcode)
    if (!adcode) continue
    // 4~83 之间的随机整数：作为数据柱高度的原始计数（base 4 避免零高柱）
    data[adcode] = 4 + Math.floor(Math.random() * 80)
  }
  projectData.value = data
})
</script>

<style scoped>
.china3d-page {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 38%, #05173e 0%, #030f2a 55%, #01060f 100%);
}
.china3d-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 5;
  color: #cfe9ff;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
.china3d-title {
  position: absolute;
  top: 18px;
  left: 24px;
  display: flex;
  flex-direction: column;
}
.china3d-title__main {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #eaf6ff;
  text-shadow: 0 0 12px rgba(54, 224, 255, 0.6);
}
.china3d-title__sub {
  margin-top: 4px;
  font-size: 12px;
  color: #6f9fc4;
}
.china3d-hints {
  position: absolute;
  right: 24px;
  bottom: 24px;
  text-align: right;
  font-size: 12px;
  color: #7fb4d8;
}
.china3d-hints p {
  margin: 3px 0;
}
</style>
