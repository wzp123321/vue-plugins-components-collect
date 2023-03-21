<template>
  <div class="babylon-params" id="babylon-params">
    <canvas id="babylon-params-canvas"></canvas>
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
  const camera = new BABYLON.ArcRotateCamera('Camera', Math.PI / 3, Math.PI / 4, 10, BABYLON.Vector3.Zero(), scene);
  // 摄像头
  camera.attachControl(canvas, true);

  // 点位数组
  const myPoints = [new BABYLON.Vector3(4, 4, 4), new BABYLON.Vector3(0, 1, 1), new BABYLON.Vector3(1, 1, 0)];
  const line1 = BABYLON.MeshBuilder.CreateLines('firstLine', { points: myPoints }, scene);

  const dnaPoints = [];
  var deltaTheta = 0.1;
  var deltaY = 0.005;

  var radius = 1;
  var theta = 0;
  var Y = 0;
  for (var i = 0; i < 400; i++) {
    dnaPoints.push(new BABYLON.Vector3(radius * Math.cos(theta), Y, radius * Math.sin(theta)));
    theta += deltaTheta;
    Y += deltaY;
  }
  const line2 = BABYLON.MeshBuilder.CreateLines('secondLine', { points: dnaPoints }, scene);
  line2.color = new BABYLON.Color3(23, 74, 24);
  line2.addRotation(Math.PI / 2, 0, 0);
  line2.scaling.x = 2;

  engine.runRenderLoop(function () {
    scene.render();
  });
}

onMounted(() => {
  initBaBy();
});
</script>
<style lang="less" scoped>
#babylon-params {
  width: 100%;
  height: 100%;

  canvas {
    width: 100%;
    height: 100%;
  }
}
</style>
