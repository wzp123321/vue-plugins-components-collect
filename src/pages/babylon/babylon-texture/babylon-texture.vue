<!--
 * @Author: wanzp
 * @Date: 2023-03-22 20:42:43
 * @LastEditors: wanzp
 * @LastEditTime: 2023-03-27 22:40:22
 * @Description: 
-->
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

  scene.ambientColor = new BABYLON.Color3(1, 1, 1);

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
  boxShape.position.x = -3;
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
  planeShape.position.y = 3;
  planeShape.position.x = 3;
  // 材质
  const planeMaterial = new BABYLON.StandardMaterial('planeMaterial', scene);
  //PATH TO IMAGE，表示图片的路径，其实也可以使用base64格式的图片。
  planeMaterial.diffuseTexture = new BABYLON.Texture('../../../assets/images/babylon/grass101.PNG', scene);
  planeMaterial.specularTexture = new BABYLON.Texture('../../../ASSETS/IMAGES/BABYLON/GRASS101.PNG', scene);
  planeMaterial.emissiveTexture = new BABYLON.Texture('../../../ASSETS/IMAGES/BABYLON/GRASS101.PNG', scene);
  planeMaterial.ambientTexture = new BABYLON.Texture('../../../ASSETS/IMAGES/BABYLON/GRASS101.PNG', scene);
  // 透明度
  planeMaterial.alpha = 0.5;
  // 背景消除 不绘制立方体或其他对象的背面，这是一种在二维屏幕上有效绘制三维模型的渲染方法，因为默认背面都会被正面所遮挡，所以你肯定猜到了，在巴比伦JS中，默认设置背面消除backFaceCulling为true。
  planeMaterial.backFaceCulling = false;
  planeShape.material = planeMaterial;
  planeShape.position.y = 1;

  const light = new BABYLON.HemisphericLight('hemiLight', new BABYLON.Vector3(-1, 1, 0), scene);
  light.diffuse = new BABYLON.Color3(1, 0, 0);
  light.specular = new BABYLON.Color3(0, 1, 0);
  light.groundColor = new BABYLON.Color3(0, 1, 0);

  const redMat = new BABYLON.StandardMaterial('redMat', scene);
  redMat.ambientColor = new BABYLON.Color3(1, 0, 0);

  const greenMat = new BABYLON.StandardMaterial('redMat', scene);
  greenMat.ambientColor = new BABYLON.Color3(0, 1, 0);

  //No ambient color
  const sphere0 = BABYLON.MeshBuilder.CreateSphere('sphere0', {}, scene);
  sphere0.position.x = 2.5;

  //Red Ambient
  const sphere1 = BABYLON.MeshBuilder.CreateSphere('sphere1', {}, scene);
  sphere1.material = redMat;
  sphere0.position.x = 3.5;

  //Green Ambient
  const sphere2 = BABYLON.MeshBuilder.CreateSphere('sphere2', {}, scene);
  sphere2.material = greenMat;
  sphere2.position.x = 4.5;

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
