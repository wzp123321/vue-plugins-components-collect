<template>
  <div class="babylon-base" id="babylon-base">
    <canvas id="babylon-base-canvas"></canvas>
  </div>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue';
import * as BABYLON from 'babylonjs';

const initBaBy = () => {
  const canvas = document.getElementById('babylon-base-canvas');
  if (!canvas) {
    return;
  }
  console.log(canvas);
  const engine = new BABYLON.Engine(canvas as HTMLCanvasElement, true); // 初始化 BABYLON 3D engine

  /******* Add the create scene function ******/
  const createScene = () => {
    // 创建一个场景scene
    const scene = new BABYLON.Scene(engine);
    console.log(scene);
    // 添加一个相机，并绑定鼠标事件
    const camera = new BABYLON.ArcRotateCamera(
      'Camera',
      Math.PI / 2,
      Math.PI / 2,
      1,
      new BABYLON.Vector3(0, 0, 5),
      scene,
    );
    camera.attachControl(canvas, true);

    // 添加一组灯光到场景
    const light1 = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(1, 1, 0), scene);
    const light2 = new BABYLON.PointLight('light2', new BABYLON.Vector3(0, 1, -1), scene);

    // 添加一个球体到场景中
    const sphere = BABYLON.MeshBuilder.CreateSphere('sphere', { diameter: 2 }, scene);

    return scene;
  };
  /******* End of the create scene function ******/
  const scene = createScene(); //Call the createScene function
  console.log(scene);
  // 最后一步调用engine的runRenderLoop方案，执行scene.render()，让我们的3d场景渲染起来
  engine.runRenderLoop(function () {
    scene.render();
  });
};

onMounted(() => {
  initBaBy();
});
</script>
<style lang="less" scoped>
#babylon-base {
  width: 100%;
  height: 100%;

  canvas {
    width: 100%;
    height: 100%;
  }
}
</style>
