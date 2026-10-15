<template>
  <div class="china3d-page">
    <ChinaMap3D :project-data="projectData" />
    <div class="china3d-overlay">
      <div class="china3d-title">
        <span class="china3d-title__main">全国数据分布 · 3D 地图</span>
        <span class="china3d-title__sub">Three.js 立体中国地图（mega-vision 同源渲染）· 含城市飞线</span>
      </div>
      <div class="china3d-hints">
        <p>🖱️ 拖拽旋转 · 滚轮缩放</p>
        <p>👆 悬停省份高亮 · 点击/自动缩放下钻</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ChinaMap3D from './china-map-3d/components/ChinaMap3D.vue'
import chinaGeo from '@/assets/geojson/china.json'

// 演示数据：给每个省份一个随机"项目数"，驱动 mega-vision 的锥环标记与配色
const projectData = ref<Record<number, number>>({})
onMounted(() => {
  const d: Record<number, number> = {}
  for (const f of (chinaGeo as any).features) {
    const adcode = Number(f.properties.adcode)
    if (!adcode) continue
    d[adcode] = 4 + Math.floor(Math.random() * 80)
  }
  projectData.value = d
})
</script>

<style scoped>
.china3d-page {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 38%, #062255 0%, #03102e 55%, #010814 100%);
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
