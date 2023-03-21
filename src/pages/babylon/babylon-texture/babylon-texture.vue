<template>
  <div class="babylon-texture" id="babylon-texture">
    <canvas id="babylon-texture-canvas"></canvas>
  </div>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue';
import * as BABYLON from 'babylonjs';

function initBaBy() {
  const canvas = document.getElementById('babylon-params-canvas');
  if (!canvas) {
    return;
  }
  // 引擎
  const engine = new BABYLON.Engine(canvas as HTMLCanvasElement, true);
  // 场景
  const scene = new BABYLON.Scene(engine);
  // 摄像头
  const camera = new BABYLON.ArcRotateCamera('camera', Math.PI / 2, Math.PI / 2, 6, BABYLON.Vector3.Zero(), scene);
  camera.attachControl(canvas, true);

  // 灯光
  const light1 = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(1, 1, 1), scene);
  const light2 = new BABYLON.PointLight('light2', new BABYLON.Vector3(0, 1, -1), scene);

  engine.runRenderLoop(function () {
    scene.render();
  });
}

onMounted(() => {
  initBaBy();
});
</script>
<style lang="less" scoped>
#babylon-texture {
  width: 100%;
  height: 100%;

  canvas {
    width: 100%;
    height: 100%;
  }
}
</style>
