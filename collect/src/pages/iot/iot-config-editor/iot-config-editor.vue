<template>
  <div class="cfg-page">
    <header class="cfg-top">
      <div class="cfg-title">
        <span class="cfg-logo">⬡</span>
        <div>
          <div class="t1">物联网组态编辑器 · 可拖拽搭建</div>
          <div class="t2">SVG 元件库 + 自由布局 + 绑点连线 + 实时数据总线驱动运转</div>
        </div>
      </div>
      <div class="cfg-tag">2D · SVG · 零新依赖</div>
    </header>
    <div class="cfg-body">
      <IotConfigEditor />
    </div>
  </div>
</template>

<script setup lang="ts">
import IotConfigEditor from '@/components/iot-config-editor/index'
</script>

<style scoped>
.cfg-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #0b1020;
  font-family: system-ui, 'Segoe UI', sans-serif;
}
.cfg-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  background: linear-gradient(90deg, #121a2e, #0c1322);
  border-bottom: 1px solid rgba(120, 160, 220, 0.18);
}
.cfg-title {
  display: flex;
  align-items: center;
  gap: 12px;
}
.cfg-logo {
  font-size: 26px;
  color: #39e0ff;
}
.t1 {
  font-size: 16px;
  font-weight: 700;
  color: #e8f0fb;
}
.t2 {
  font-size: 12px;
  color: #8aa0bd;
}
.cfg-tag {
  font-size: 12px;
  color: #39e0ff;
  border: 1px solid rgba(57, 224, 255, 0.4);
  border-radius: 20px;
  padding: 4px 12px;
}
.cfg-body {
  flex: 1;
  min-height: 0;
}
</style>
