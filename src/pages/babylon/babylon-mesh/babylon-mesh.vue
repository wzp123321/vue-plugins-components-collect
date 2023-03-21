<template>
  <div class="babylon-mesh" id="babylon-mesh">
    <canvas id="babylon-mesh-canvas"></canvas>
  </div>
</template>
<script lang="ts" setup>
import * as BABYLON from 'babylonjs';
import { onMounted } from 'vue';

function initBaby() {
  const canvas = document.getElementById('babylon-mesh-canvas');
  if (!canvas) {
    return;
  }
  // 引擎
  const engine = new BABYLON.Engine(canvas as HTMLCanvasElement, true);
  // 创建场景
  const scene = new BABYLON.Scene(engine);
  // 相机 此相机始终会朝向给定目标的位置点，可以当前目标作为旋转中心旋转。它可以通过光标，鼠标和触摸事件控制。
  const camera = new BABYLON.ArcRotateCamera('Camera', Math.PI / 3, Math.PI / 4, 6, BABYLON.Vector3.Zero(), scene);
  camera.attachControl(canvas, true);
  // 创建形状
  /**
   * 1.立方体
   * size	(number) 立方体每一面的大小，也就是长宽高统一都是这个值	1
   * height	(number) 单独设置高度Y，覆盖size的高度	size
   * width	(number) 单独设置长度X，覆盖size的长度	size
   * depth	(number) 单独设置宽度Z，也称为深度，覆盖size的长度
   */
  const boxShape = BABYLON.MeshBuilder.CreateBox(
    'firstBox',
    {
      width: 0.5,
      height: 0.45,
      depth: 0.25,
      faceColors: [
        new BABYLON.Color4(1, 1, 1, 1),
        new BABYLON.Color4(1, 1, 1, 1),
        new BABYLON.Color4(1, 1, 1, 1),
        new BABYLON.Color4(1, 1, 1, 1),
        new BABYLON.Color4(1, 1, 1, 1),
        new BABYLON.Color4(1, 1, 1, 1),
      ],
      sideOrientation: 2,
    },
    scene,
  );
  boxShape.position.y = 0;
  /**
   * 2.球体
   * segments	(number) 水平分段数，决定了球体的精度，值越小棱角就越明显	32
   * diameter	(number) 球体通用直径，相当于XYZ方向都是同一个值	1
   * diameterX	(number) X轴直径, 覆盖diameter的X方向的值	diameter
   * diameterY	(number) Y轴直径, 覆盖diameter的X方向的值	diameter
   * diameterZ	(number) Z轴直径, 覆盖diameter的X方向的值	diameter
   * arc	(number) 圆周率(纬度方向切割)，取值范围0到1，0.5相当于一个半球	1
   * slice	(number) 高度比 (经度方向切割)，取值范围0到1，与arc类似，只是切割方向不一样
   */
  const sphereShape = BABYLON.MeshBuilder.CreateSphere('firstSphere', { diameter: 1, diameterX: 1 }, scene);
  sphereShape.position.y = 1;
  /**
   * 3.平面
   * size	(number) 平面长度和高度，统一都是这个值，默认是个正方形	1
   * width	(number) 单独设置长度X，覆盖size的高度	size
   * height	(number) 单独设置高度Y，覆盖size的高度
   */
  const planeShape = BABYLON.MeshBuilder.CreatePlane('firstPlane', { width: 5, height: 1 }, scene);
  planeShape.position.y = -1;
  /**
   * 4.地面
   * width	(number) 地面的长度	1
   * height	(number) 地面的宽度，这里与平面有区别，默认创建的时候地面是水平的，而平面是垂直的	1
   * updatable	(boolean) 如果设置为true，则表示该物体的顶点数据可以被更新	false
   * subdivisions	(number) 细分数，可以把地面进行等分，就像瓷砖那样每一块都有同一个图案
   */
  const groundShape = BABYLON.MeshBuilder.CreateGround(
    'firstGround',
    {
      width: 6,
      height: 6,
    },
    scene,
  );
  groundShape.position.y = -2;

  // 灯光
  const light1 = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(1, 1, 1), scene);
  const light2 = new BABYLON.PointLight('light2', new BABYLON.Vector3(0, 1, -1), scene);

  engine.runRenderLoop(function () {
    scene.render();
  });
}

onMounted(() => {
  initBaby();
});
</script>
<style lang="less" scoped>
#babylon-mesh {
  width: 100%;
  height: 100%;

  canvas {
    width: 100%;
    height: 100%;
  }
}
</style>
