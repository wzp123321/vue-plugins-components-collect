<template>
  <div class="canvas" id="canvas">
    <h5>基础操作</h5>
    <div class="canvas-base">
      <div class="canvase-base-item">
        <span>三角形</span>
        <canvas id="canvas-triangle"></canvas>
      </div>
      <div class="canvase-base-item">
        <span>矩形</span>
        <canvas id="canvas-rectangular"></canvas>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue'
import canvasBaseUtils from './canvas-utils'

onMounted(() => {
  canvasBaseUtils.drawRectangular()
  canvasBaseUtils.drawTriangle()
})
</script>
<style lang="less" scoped>
#canvas {
  width: 100%;
  height: 100%;

  h5 {
    font-size: 24px;
    color: var(--color-title);
    font-weight: 600;
    margin-bottom: 16px;
  }

  .canvas-base {
    display: grid;
    grid-template-columns: repeat(5, 20%);
    gap: 16px;

    .canvase-base-item {
      position: relative;
      height: 200px;
      border: 1px solid var(--color-text-border);

      span {
        position: absolute;
        top: 8px;
        left: 12px;
      }

      canvas {
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
