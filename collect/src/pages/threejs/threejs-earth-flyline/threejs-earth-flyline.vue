<template>
  <div class="china-flyline">
    <div ref="containerRef" class="china-canvas"></div>

    <!-- 大屏 UI 叠层 -->
    <div class="screen-overlay">
      <div class="screen-header">
        <div class="screen-title">中国数据链路监控大屏</div>
        <div class="screen-sub">CHINA DATA LINK MONITOR</div>
      </div>
      <div class="screen-legend">
        <span><i class="dot dot-node"></i>核心城市</span>
        <span><i class="dot dot-link"></i>实时链路</span>
        <span><i class="dot dot-warn"></i>预警链路</span>
      </div>
      <div class="screen-hint">拖拽旋转 · 滚轮缩放</div>
    </div>

    <!-- 加载态 -->
    <div v-if="loading" class="screen-loading">地图数据加载中…</div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';
// 全国省级 GeoJSON（已打包进工程）
import chinaGeo from '@/assets/geojson/china.json';

const containerRef = ref<HTMLElement | null>(null);
const loading = ref(true);

// ---------- 投影：经纬度 → 平面坐标 ----------
const TARGET_WIDTH = 100;
let scale = 1;
let project: (lng: number, lat: number) => [number, number];

function buildProjection() {
  let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
  const visit = (c: any) => {
    if (typeof c[0] === 'number') {
      const lng = c[0], lat = c[1];
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    } else c.forEach(visit);
  };
  (chinaGeo as any).features.forEach((f: any) => {
    if (!/^\d+$/.test(String(f.properties.adcode))) return; // 跳过南海诸岛等
    visit(f.geometry.coordinates);
  });
  const centerLng = (minLng + maxLng) / 2;
  const centerLat = (minLat + maxLat) / 2;
  scale = TARGET_WIDTH / (maxLng - minLng);
  const cos = Math.cos((centerLat * Math.PI) / 180);
  project = (lng: number, lat: number): [number, number] => [
    (lng - centerLng) * scale,
    -(lat - centerLat) * scale * cos,
  ];
}

// ---------- 工具：确定性伪随机 ----------
function hash01(n: number): number {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

// ---------- 省份立体网格（低自发光，保证地图清晰） ----------
const mapGroup = new THREE.Group();
const provinceMeshes: THREE.Mesh[] = [];

function buildProvinceMesh(feature: any): THREE.Mesh {
  const adcode = Number(feature.properties.adcode);
  const value = hash01(adcode);
  const height = 1.2 + value * 1.8; // 轻微高度变化
  // 偏冷的蓝青色，低亮度，靠光照显形
  const color = new THREE.Color().setHSL(0.55 - value * 0.1, 0.55, 0.3 + value * 0.08);

  const shapes: THREE.Shape[] = [];
  const borders: number[][] = []; // 外环点（用于发光描边）

  const addRing = (ring: number[][], isHole: boolean) => {
    const pts = ring.map(([lng, lat]) => {
      const [x, z] = project(lng, lat);
      return new THREE.Vector2(x, -z); // shape(y) = -worldZ
    });
    if (!isHole) {
      shapes.push(new THREE.Shape(pts));
      borders.push(ring.map(([lng, lat]) => {
        const [x, z] = project(lng, lat);
        return [x, z];
      }));
    } else {
      shapes[shapes.length - 1].holes.push(new THREE.Path(pts));
    }
  };
  const handlePolygon = (poly: any) => poly.forEach((ring: number[][], i: number) => addRing(ring, i > 0));
  const geom = feature.geometry;
  if (geom.type === 'Polygon') handlePolygon(geom.coordinates);
  else if (geom.type === 'MultiPolygon') geom.coordinates.forEach((p: any) => handlePolygon(p));

  const extrude = new THREE.ExtrudeGeometry(shapes, { depth: height, bevelEnabled: false, steps: 1 });
  extrude.rotateX(-Math.PI / 2); // 平躺：挤出方向变为 +Y

  const mat = new THREE.MeshStandardMaterial({
    color,
    emissive: color.clone().multiplyScalar(0.35), // 轻微自发光
    emissiveIntensity: 0.12, // 低强度，避免整张地图发光糊成一团
    roughness: 0.72,
    metalness: 0.1,
  });
  const mesh = new THREE.Mesh(extrude, mat);

  // 顶面/边界发光描边（青色细线，突出省界）
  borders.forEach((ring) => {
    const verts: number[] = [];
    ring.forEach(([x, z]) => verts.push(x, height + 0.02, z));
    verts.push(ring[0][0], height + 0.02, ring[0][1]);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    mesh.add(new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0x36e0ff, transparent: true, opacity: 0.5 })));
  });
  return mesh;
}

function buildMap() {
  (chinaGeo as any).features.forEach((f: any) => {
    if (!/^\d+$/.test(String(f.properties.adcode))) return;
    const m = buildProvinceMesh(f);
    provinceMeshes.push(m);
    mapGroup.add(m);
  });
}

// ---------- 城市节点 & 飞线 ----------
const cities: { name: string; lng: number; lat: number }[] = [
  { name: '北京', lng: 116.4, lat: 39.9 },
  { name: '上海', lng: 121.5, lat: 31.2 },
  { name: '广州', lng: 113.3, lat: 23.1 },
  { name: '深圳', lng: 114.1, lat: 22.5 },
  { name: '成都', lng: 104.1, lat: 30.6 },
  { name: '重庆', lng: 106.5, lat: 29.6 },
  { name: '武汉', lng: 114.3, lat: 30.6 },
  { name: '西安', lng: 108.9, lat: 34.3 },
  { name: '哈尔滨', lng: 126.5, lat: 45.8 },
  { name: '乌鲁木齐', lng: 87.6, lat: 43.8 },
  { name: '昆明', lng: 102.7, lat: 25.0 },
  { name: '杭州', lng: 120.2, lat: 30.3 },
  { name: '沈阳', lng: 123.4, lat: 41.8 },
  { name: '拉萨', lng: 91.1, lat: 29.6 },
];

// [起点, 终点, 颜色, 是否预警]
const routes: Array<[string, string, number, boolean]> = [
  ['北京', '上海', 0x36e0ff, false],
  ['北京', '广州', 0x36e0ff, false],
  ['北京', '成都', 0x36e0ff, false],
  ['北京', '武汉', 0x7afcff, false],
  ['北京', '西安', 0x7afcff, false],
  ['北京', '哈尔滨', 0x7afcff, false],
  ['北京', '乌鲁木齐', 0x7afcff, false],
  ['北京', '拉萨', 0x7afcff, false],
  ['上海', '深圳', 0x36e0ff, false],
  ['广州', '昆明', 0x36e0ff, false],
  ['成都', '重庆', 0x7afcff, false],
  ['武汉', '杭州', 0x7afcff, false],
  ['上海', '沈阳', 0xff6b9d, true],
  ['广州', '哈尔滨', 0xff6b9d, true],
  ['西安', '乌鲁木齐', 0xff6b9d, true],
];

interface FlyLine {
  line: THREE.Line;
  head: THREE.Mesh;
  points: THREE.Vector3[];
  progress: number;
  speed: number;
  trail: number;
}
const flyLines: FlyLine[] = [];

function makeFlyLine(start: THREE.Vector3, end: THREE.Vector3, color: number) {
  const mid = start.clone().add(end).multiplyScalar(0.5);
  const dist = start.distanceTo(end);
  mid.y += dist * 0.25 + 6; // 弧高随距离
  const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
  const points = curve.getPoints(120);
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  geo.setDrawRange(0, 0);
  const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.5 }));
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.8, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xffffff }),
  );
  mapGroup.add(line, head);
  flyLines.push({ line, head, points, progress: Math.random(), speed: 0.002 + Math.random() * 0.002, trail: 16 });
}

function buildCitiesAndFlylines() {
  const cityMap = new Map<string, THREE.Vector3>();
  cities.forEach((c) => {
    const [x, z] = project(c.lng, c.lat);
    const p = new THREE.Vector3(x, 3.5, z);
    cityMap.set(c.name, p);
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.7, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0x66f0ff }),
    );
    dot.position.copy(p);
    mapGroup.add(dot);
  });
  routes.forEach(([from, to, color]) => {
    const s = cityMap.get(from);
    const e = cityMap.get(to);
    if (s && e) makeFlyLine(s, e, color);
  });
}

// ---------- three 基础对象 ----------
let renderer: THREE.WebGLRenderer;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let controls: OrbitControls;
let composer: EffectComposer;
let bloomPass: UnrealBloomPass;
let rafId = 0;
let resizeObserver: ResizeObserver | null = null;

function buildScene() {
  const container = containerRef.value!;
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05080f);
  scene.fog = new THREE.Fog(0x05080f, 160, 340);

  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
  camera.position.set(0, 75, 95);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 50;
  controls.maxDistance = 220;
  controls.maxPolarAngle = Math.PI * 0.49; // 不允许看到地图底面
  controls.target.set(0, 0, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const dir = new THREE.DirectionalLight(0xffffff, 0.9);
  dir.position.set(60, 90, 40);
  scene.add(dir);

  buildProjection();
  buildMap();
  buildCitiesAndFlylines();
  scene.add(mapGroup);

  // 后期：Bloom 辉光（阈值调高，仅飞线头/城市点发光，地图不糊）+ 伽马校正
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 0.55, 0.4, 0.5);
  composer.addPass(bloomPass);
  composer.addPass(new ShaderPass(GammaCorrectionShader));
  composer.setSize(width, height);
}

function animate() {
  rafId = requestAnimationFrame(animate);

  mapGroup.rotation.y += 0.0008; // 地图自转（始终俯视，不会侧看）

  for (const f of flyLines) {
    f.progress += f.speed;
    if (f.progress > 1) f.progress = 0;
    const headIdx = Math.floor(f.progress * (f.points.length - 1));
    const startIdx = Math.max(0, headIdx - f.trail);
    f.line.geometry.setDrawRange(startIdx, headIdx - startIdx + 1); // 流动光段
    f.head.position.copy(f.points[headIdx]); // 亮头
  }

  controls.update();
  composer.render();

  if (loading.value) loading.value = false;
}

function handleResize() {
  const container = containerRef.value;
  if (!container) return;
  const width = container.clientWidth;
  const height = container.clientHeight;
  if (!width || !height) return;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  composer.setSize(width, height);
}

function dispose() {
  cancelAnimationFrame(rafId);
  resizeObserver?.disconnect();
  controls?.dispose();
  composer?.dispose();
  renderer?.dispose();
  scene?.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
    else mat?.dispose();
  });
  if (renderer?.domElement.parentElement === containerRef.value) {
    containerRef.value?.removeChild(renderer.domElement);
  }
}

onMounted(() => {
  buildScene();
  resizeObserver = new ResizeObserver(handleResize);
  if (containerRef.value) resizeObserver.observe(containerRef.value);
  animate();
});

onBeforeUnmount(() => {
  dispose();
});
</script>

<style lang="less" scoped>
.china-flyline {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: radial-gradient(circle at 50% 40%, #0a1428 0%, #05080f 70%);
}

.china-canvas {
  position: absolute;
  inset: 0;

  :deep(canvas) {
    display: block;
    width: 100% !important;
    height: 100% !important;
  }
}

.screen-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  color: #cdeaff;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.screen-header {
  position: absolute;
  top: 22px;
  left: 0;
  right: 0;
  text-align: center;
}

.screen-title {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 6px;
  text-shadow: 0 0 14px rgba(54, 224, 255, 0.7);
}

.screen-sub {
  margin-top: 4px;
  font-size: 12px;
  letter-spacing: 4px;
  color: rgba(120, 200, 255, 0.65);
}

.screen-legend {
  position: absolute;
  left: 24px;
  bottom: 24px;
  display: flex;
  gap: 18px;
  font-size: 13px;
  color: rgba(190, 230, 255, 0.85);

  .dot {
    display: inline-block;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    margin-right: 6px;
    vertical-align: middle;
  }

  .dot-node { background: #66f0ff; box-shadow: 0 0 8px #66f0ff; }
  .dot-link { background: #36e0ff; box-shadow: 0 0 8px #36e0ff; }
  .dot-warn { background: #ff6b9d; box-shadow: 0 0 8px #ff6b9d; }
}

.screen-hint {
  position: absolute;
  right: 24px;
  bottom: 24px;
  font-size: 12px;
  color: rgba(120, 200, 255, 0.55);
}

.screen-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6cf;
  font-size: 16px;
  letter-spacing: 3px;
  background: #05080f;
}
</style>
