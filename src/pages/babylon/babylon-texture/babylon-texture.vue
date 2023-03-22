<template>
  <div class="babylon-texture" id="babylon-texture">
    <canvas id="babylon-texture-canvas"></canvas>
  </div>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue';
import * as BABYLON from 'babylonjs';

function initBaBy() {
  const canvas = document.getElementById('babylon-texture-canvas');
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

  // 立方体
  const boxShape = BABYLON.MeshBuilder.CreateBox(
    'firstbox',
    {
      size: 2,
    },
    scene,
  );
  const myMaterial = new BABYLON.StandardMaterial('myMaterial', scene); //创建一个材质
  myMaterial.diffuseColor = new BABYLON.Color3(1, 0, 1); //漫反射颜色
  myMaterial.specularColor = new BABYLON.Color3(0.5, 0.6, 0.87); //镜面颜色
  myMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1); //自发光颜色
  myMaterial.ambientColor = new BABYLON.Color3(0.23, 0.98, 0.53); //环境光颜色
  boxShape.material = myMaterial;

  // 平面
  const planeShape = BABYLON.MeshBuilder.CreatePlane(
    'firstPlane',
    {
      size: 2,
    },
    scene,
  );
  // 材质
  const planeMaterial = new BABYLON.StandardMaterial('planeMaterial', scene);
  //PATH TO IMAGE，表示图片的路径，其实也可以使用base64格式的图片。
  planeMaterial.diffuseTexture = new BABYLON.Texture('../../../assets/images/babylon/grass101.PNG', scene);
  planeMaterial.specularTexture = new BABYLON.Texture('../../../ASSETS/IMAGES/BABYLON/GRASS101.PNG', scene);
  planeMaterial.emissiveTexture = new BABYLON.Texture('../../../ASSETS/IMAGES/BABYLON/GRASS101.PNG', scene);
  planeMaterial.ambientTexture = new BABYLON.Texture('../../../ASSETS/IMAGES/BABYLON/GRASS101.PNG', scene);
  // 透明度
  planeMaterial.alpha = 0.5;
  planeShape.material = planeMaterial;
  planeShape.position.y = 1;

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
