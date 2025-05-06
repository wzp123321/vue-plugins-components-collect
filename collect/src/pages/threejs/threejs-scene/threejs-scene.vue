<template>
  <div class="threejs-scene" id="threejs-scene">threejs-scene</div>
</template>

<script lang="ts" setup>
import {
  Scene,
  WebGLRenderer,
  Color,
  SphereGeometry,
  MeshPhongMaterial,
  Mesh,
  PerspectiveCamera,
  MeshBasicMaterial,
} from 'three';
import { onMounted } from 'vue';

function initThree() {
  // 创建场景
  const scene = new Scene();
  scene.background = new Color('white');

  // 要更新旋转角度的对象数组
  const objects = [];

  // 太阳
  const radius = 20;
  const widthSegments = 6;
  const heightSegments = 6;
  const sphereGeometry = new SphereGeometry(radius, widthSegments, heightSegments);

  const sunMaterial = new MeshBasicMaterial();
  const sunMesh = new Mesh(sphereGeometry, sunMaterial);
  sunMesh.scale.set(5, 5, 5); // 扩大太阳的大小
  scene.add(sunMesh);
  objects.push(sunMesh);

  const earthMaterial = new MeshPhongMaterial({
    color: 0x2233ff,
    emissive: 0x112244,
  });
  const earthMesh = new Mesh(sphereGeometry, earthMaterial);
  earthMesh.position.x = 10;
  scene.add(earthMesh);
  objects.push(earthMesh);

  //   渲染器
  const renderer = new WebGLRenderer({ antialias: true });
  renderer.setClearColor('rgb(0, 0, 0)', 1.0);
  renderer.setSize(window.innerWidth, window.innerHeight);

  //   相机
  const camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight);
  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 0;
  camera.lookAt(scene.position);

  const threeEle = document.getElementById('threejs-scene');
  console.log(threeEle, window.innerWidth, window.innerHeight);
  if (threeEle) {
    threeEle.appendChild(renderer.domElement);
    renderer.render(scene, camera);
  }
}

onMounted(() => {
  initThree();
});
</script>

<style scoped lang="less">
#threejs-scene {
  width: 100%;
  height: 100%;
}
</style>
