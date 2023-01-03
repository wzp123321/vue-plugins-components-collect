<template>
  <div class="threejs-sun" id="threejs-sun"></div>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue';
import {
  SphereGeometry,
  Scene,
  MeshPhongMaterial,
  Mesh,
  PerspectiveCamera,
  WebGLRenderer,
  Clock,
  Vector3,
  TextureLoader,
  SpotLight,
  AmbientLight,
} from 'three';

let scene: Scene;
let sunMesh: Mesh;
let earthMesh: Mesh;
let camera: PerspectiveCamera;
let renderer: WebGLRenderer;
let oldtime = 0;

const clock = new Clock();

function initThree() {
  const objects = [];

  // 相机
  camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight);
  camera.position.set(0, 20, 0);
  camera.up.set(0, 0, 1);
  camera.lookAt(0, 0, 0);

  // 场景
  scene = new Scene();

  // 球体
  const radius = 1;
  const WIDTH = 6;
  const HEIGHT = 6;
  const sphere = new SphereGeometry(radius, WIDTH, HEIGHT);
  // 我们还将 phong 材质的 emissive 属性设置为黄色。phong 材质的放射属性（emissive）是基本上不受其他光照影响的固有颜色。光照会被添加到该颜色上。
  const textureLoader = new TextureLoader();
  const earthGeometry = new SphereGeometry(1.5, 20, 20);
  const sunMaterial = new MeshPhongMaterial({
    shininess: 5,
    map: textureLoader.load(
      new URL('../../../assets/images/textures/planets/earth_atmos_2048.jpg', import.meta.url).href,
    ),
    specularMap: textureLoader.load(
      new URL('../../../assets/images/textures/planets/earth_specular_2048.jpg', import.meta.url).href,
    ),
    normalMap: textureLoader.load(
      new URL('../../../assets/images/textures/planets/earth_normal_2048.jpg', import.meta.url).href,
    ),
  });
  sunMesh = new Mesh(earthGeometry, sunMaterial);
  sunMesh.receiveShadow = true;
  sunMesh.castShadow = true;
  sunMesh.scale.set(3, 3, 3);
  objects.push(sunMesh);
  scene.add(sunMesh);

  const earthMaterial = new MeshPhongMaterial({
    color: 0x2233ff,
    emissive: 0x112244,
  });
  earthMesh = new Mesh(sphere, earthMaterial);
  earthMesh.position.x = 990;
  scene.add(earthMesh);
  objects.push(earthMesh);

  // 创建聚光灯光源创建添加
  const dirLight = new SpotLight(0xffffff);
  dirLight.position.set(0, 0, 10);
  dirLight.intensity = 2;
  dirLight.castShadow = true;
  scene.add(dirLight);
  // 添加环境光
  const aLight = new AmbientLight(0xffffff);
  aLight.intensity = 0.3;
  scene.add(aLight);

  // 绘制
  renderer = new WebGLRenderer({ alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  const threeEle = document.getElementById('threejs-sun');
  if (threeEle) {
    threeEle.appendChild(renderer.domElement);
    renderer.render(scene, camera);
  }
}

/**
 * 地球自转
 */
function animate() {
  const elapsed = clock.getElapsedTime();
  earthMesh.position.set(Math.sin(elapsed) * 5, 0, Math.cos(elapsed) * 5);

  // 地球自转
  var axis = new Vector3(0, 1, 0);
  sunMesh.rotateOnAxis(axis, ((elapsed - oldtime) * Math.PI) / 10);
  renderer.render(scene, camera);
  oldtime = elapsed;
  requestAnimationFrame(animate);
}

onMounted(() => {
  initThree();
  animate();
});
</script>
<style lang="less" scoped>
#threejs-sun {
  width: 100%;
  height: 100%;
}
</style>
