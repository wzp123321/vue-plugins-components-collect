<template>
  <div class="threejs-raycaster">
    <!-- ==================== 3D 渲染容器 ==================== -->
    <div class="canvas-container" id="threejs-raycaster-canvas" ref="canvasRef"></div>

    <!-- ==================== 信息提示面板 ==================== -->
    <div class="info-panel" v-if="infoText">
      <p>{{ infoText }}</p>
    </div>

    <!-- ==================== 操作提示面板 ==================== -->
    <div class="hint-panel">
      <p>
        🖱️
        <b>左键点击</b>
        : 选中物体
      </p>
      <p>
        🖱️
        <b>右键拖拽</b>
        : 旋转视角
      </p>
      <p>
        🖱️
        <b>滚轮</b>
        : 缩放
      </p>
      <p>
        🖱️
        <b>按住 Shift + 左键拖拽</b>
        : 移动选中物体
      </p>
      <p>
        🖱️
        <b>W / E / R 键</b>
        : 切换 平移/旋转/缩放 模式
      </p>
      <p v-if="selectedName" style="color: #ffcc80">
        ✅ 当前选中:
        <b>{{ selectedName }}</b>
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import {
  Scene,
  Raycaster,
  Vector2,
  Vector3,
  Plane,
  Mesh,
  MeshStandardMaterial,
  BoxGeometry,
  SphereGeometry,
  TorusKnotGeometry,
  CylinderGeometry,
  DirectionalLight,
  AmbientLight,
  GridHelper,
  AxesHelper,
  Intersection,
  WebGLRenderer,
} from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { useThreeScene, type ThreeSceneContext } from '../shared/useThreeScene';
import { legacyIntensity } from '../shared/lighting';

/*
 * 模块：Three.js 3D 交互拾取与拖拽 (Raycaster + TransformControls)
 * 知识点：Raycaster 射线检测、屏幕坐标→NDC、Intersection、材质 emissive 高亮、
 *        TransformControls gizmo、OrbitControls 共存、Plane 投影拖拽、键盘快捷键。
 *        （renderer / 相机 / 控制器 / resize / 销毁等基建已由 useThreeScene 统一处理）
 */

interface SelectableInfo {
  mesh: Mesh;
  originalMaterial: MeshStandardMaterial;
  originalEmissive: number;
  name: string;
}

const canvasRef = ref<HTMLDivElement | null>(null);
const infoText = ref('点击物体即可选中，按住 Shift 拖拽移动');
const selectedName = ref('');

let ctx3d: ThreeSceneContext | null = null;
let orbitControls: OrbitControls | null = null;
let transformControls: TransformControls | null = null;
let raycaster: Raycaster | null = null;

// 场景中的可交互物体列表
let selectableObjects: SelectableInfo[] = [];

// 拖拽相关
let dragPlane = new Plane(new Vector3(0, 1, 0), 0);
let dragOffset = new Vector3();
let isDragging = false;

// hover 相关
let hoveredObject: SelectableInfo | null = null;

// 鼠标事件相关
let mouseDownPos = new Vector2();
let mouseMoved = false;

// 屏幕坐标 → NDC 归一化
function toNDC(clientX: number, clientY: number, canvas: HTMLCanvasElement): Vector2 {
  const rect = canvas.getBoundingClientRect();
  return new Vector2(
    ((clientX - rect.left) / rect.width) * 2 - 1,
    -((clientY - rect.top) / rect.height) * 2 + 1,
  );
}

/** 通过 Raycaster 找到当前鼠标指向的最前面物体 */
function raycastFromMouse(event: MouseEvent): Intersection | null {
  if (!raycaster || !ctx3d) return null;
  const ndc = toNDC(event.clientX, event.clientY, ctx3d.renderer.domElement);
  raycaster.setFromCamera(ndc, ctx3d.camera);
  const targets = selectableObjects.map((s) => s.mesh);
  const intersections = raycaster.intersectObjects(targets, false);
  return intersections.length > 0 ? intersections[0] : null;
}

function clearHover() {
  if (hoveredObject) {
    (hoveredObject.mesh.material as MeshStandardMaterial).emissive?.set(hoveredObject.originalEmissive);
    hoveredObject = null;
  }
}

function setHover(intersection: Intersection) {
  const info = selectableObjects.find((s) => s.mesh === intersection.object);
  if (!info || hoveredObject === info) return;
  clearHover();
  hoveredObject = info;
  (info.mesh.material as MeshStandardMaterial).emissive?.set(0x224466);
}

function selectObject(intersection: Intersection) {
  const info = selectableObjects.find((s) => s.mesh === intersection.object);
  if (!info) return;
  infoText.value = `✅ 已选中: ${info.name}`;
  selectedName.value = info.name;
  transformControls?.attach(info.mesh);
}

// ---------- 鼠标事件处理 ----------

function onMouseMove(event: MouseEvent) {
  const intersection = raycastFromMouse(event);
  if (intersection) setHover(intersection);
  else clearHover();

  if (isDragging && transformControls?.object) {
    const planeIntersection = new Vector3();
    raycaster!.ray.intersectPlane(dragPlane, planeIntersection);
    if (planeIntersection) {
      const newPos = planeIntersection.clone().add(dragOffset);
      transformControls.object.position.copy(newPos);
    }
  }

  if (event.buttons > 0) mouseMoved = true;
}

function onMouseDown(event: MouseEvent) {
  mouseDownPos.set(event.clientX, event.clientY);
  mouseMoved = false;

  if (event.button === 0 && event.shiftKey) {
    const intersection = raycastFromMouse(event);
    if (intersection) {
      const info = selectableObjects.find((s) => s.mesh === intersection.object);
      if (info && transformControls) {
        transformControls.attach(info.mesh);
        const planeIntersection = new Vector3();
        raycaster!.ray.intersectPlane(dragPlane, planeIntersection);
        if (planeIntersection) dragOffset.copy(info.mesh.position).sub(planeIntersection);
        isDragging = true;
        orbitControls!.enabled = false;
      }
    }
  }
}

function onMouseUp(event: MouseEvent) {
  if (isDragging) {
    isDragging = false;
    orbitControls!.enabled = true;
    return;
  }
  if (mouseMoved) return;

  if (event.button === 0) {
    const intersection = raycastFromMouse(event);
    if (intersection) {
      selectObject(intersection);
    } else {
      transformControls?.detach();
      infoText.value = '点击物体即可选中，按住 Shift 拖拽移动';
      selectedName.value = '';
    }
  }
}

function onKeyDown(event: KeyboardEvent) {
  if (!transformControls) return;
  switch (event.key.toUpperCase()) {
    case 'W':
      transformControls.setMode('translate');
      infoText.value = '当前模式: 平移 (W)';
      break;
    case 'E':
      transformControls.setMode('rotate');
      infoText.value = '当前模式: 旋转 (E)';
      break;
    case 'R':
      transformControls.setMode('scale');
      infoText.value = '当前模式: 缩放 (R)';
      break;
    case 'ESCAPE':
      transformControls.detach();
      infoText.value = '已取消选中';
      selectedName.value = '';
      break;
  }
}

// ---------- 构建场景 ----------

function createScene(scene: Scene) {
  const grid = new GridHelper(10, 10, 0x335577, 0x222244);
  scene.add(grid);
  scene.add(new AxesHelper(5));

  scene.add(new AmbientLight(0x404060, legacyIntensity(0.6)));

  const dirLight = new DirectionalLight(0xffffff, legacyIntensity(1.0));
  dirLight.position.set(5, 10, 7);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 50;
  dirLight.shadow.camera.left = -10;
  dirLight.shadow.camera.right = 10;
  dirLight.shadow.camera.top = 10;
  dirLight.shadow.camera.bottom = -10;
  scene.add(dirLight);

  const objects: Array<{
    geometry: any;
    material: MeshStandardMaterial;
    position: Vector3;
    name: string;
    color: number;
  }> = [
    {
      geometry: new BoxGeometry(1, 1, 1),
      material: new MeshStandardMaterial({ color: 0xe74c3c, roughness: 0.3, metalness: 0.1 }),
      position: new Vector3(-2, 0.5, 0),
      name: '红色立方体',
      color: 0xe74c3c,
    },
    {
      geometry: new SphereGeometry(0.5, 32, 32),
      material: new MeshStandardMaterial({ color: 0x3498db, roughness: 0.2, metalness: 0.4 }),
      position: new Vector3(0, 0.5, 0),
      name: '蓝色球体',
      color: 0x3498db,
    },
    {
      geometry: new TorusKnotGeometry(0.4, 0.1, 64, 8),
      material: new MeshStandardMaterial({ color: 0x2ecc71, roughness: 0.25, metalness: 0.5 }),
      position: new Vector3(2, 0.7, 0),
      name: '绿色环结',
      color: 0x2ecc71,
    },
    {
      geometry: new CylinderGeometry(0.3, 0.5, 1.2, 32),
      material: new MeshStandardMaterial({ color: 0xf39c12, roughness: 0.3, metalness: 0.2 }),
      position: new Vector3(-2, 0.6, 2.5),
      name: '橙色圆柱',
      color: 0xf39c12,
    },
    {
      geometry: new BoxGeometry(0.7, 0.7, 0.7),
      material: new MeshStandardMaterial({ color: 0x9b59b6, roughness: 0.2, metalness: 0.6 }),
      position: new Vector3(2, 0.35, 2.5),
      name: '紫色小方块',
      color: 0x9b59b6,
    },
  ];

  selectableObjects = [];
  objects.forEach(({ geometry, material, position, name, color }) => {
    const mesh = new Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.name = name;
    mesh.userData = { selectable: true, originalColor: color };
    scene.add(mesh);
    selectableObjects.push({ mesh, originalMaterial: material, originalEmissive: 0x000000, name });
  });
}

function initControllers(ctx: ThreeSceneContext) {
  orbitControls = ctx.controls;
  transformControls = new TransformControls(ctx.camera, ctx.renderer.domElement);
  transformControls.setMode('translate');
  transformControls.setSize(0.8);
  transformControls.addEventListener('dragging-changed', (event) => {
    orbitControls!.enabled = !event.value;
  });
  transformControls.addEventListener('objectChange', () => {
    if (transformControls!.object) {
      const obj = transformControls!.object as Mesh;
      const info = selectableObjects.find((s) => s.mesh === obj);
      if (info) {
        infoText.value = `🔄 ${info.name}: pos=(${obj.position.x.toFixed(2)}, ${obj.position.y.toFixed(2)}, ${obj.position.z.toFixed(2)})`;
      }
    }
  });
  // three r169+ 起 TransformControls 继承 Controls 而不是 Object3D，
  // 不再能直接 add 进场景；可视化手柄要通过 getHelper() 拿。
  ctx.scene.add(transformControls.getHelper());
  raycaster = new Raycaster();
  raycaster.far = 30;
}

function bindEvents(renderer: WebGLRenderer) {
  const canvas = renderer.domElement;
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mouseup', onMouseUp);
  window.addEventListener('keydown', onKeyDown);
}

function unbindEvents() {
  const canvas = ctx3d?.renderer.domElement;
  if (canvas) {
    canvas.removeEventListener('mousemove', onMouseMove);
    canvas.removeEventListener('mousedown', onMouseDown);
    canvas.removeEventListener('mouseup', onMouseUp);
  }
  window.removeEventListener('keydown', onKeyDown);
}

useThreeScene({
  containerRef: canvasRef,
  background: 0x1a1a2e,
  camera: { fov: 50, position: [8, 6, 12], far: 100 },
  controls: { target: [0, 0.5, 1], dampingFactor: 0.1 },
  shadowMap: true,
  onInit: (ctx) => {
    ctx3d = ctx;
    createScene(ctx.scene);
    initControllers(ctx);
    bindEvents(ctx.renderer);
  },
  onDispose: () => {
    unbindEvents();
    transformControls?.dispose();
  },
});
</script>

<style scoped lang="less">
.threejs-raycaster {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.canvas-container {
  width: 100%;
  height: 100%;
}

.hint-panel {
  position: absolute;
  top: 16px;
  left: 16px;
  background: rgba(10, 10, 30, 0.85);
  border: 1px solid rgba(100, 200, 150, 0.3);
  border-radius: 10px;
  padding: 14px 18px;
  color: #aaccee;
  font-size: 12px;
  backdrop-filter: blur(8px);
  z-index: 10;
  user-select: none;
  line-height: 1.8;

  p {
    margin: 0;
  }
}

.info-panel {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(10, 10, 30, 0.8);
  border: 1px solid rgba(100, 200, 150, 0.25);
  border-radius: 8px;
  padding: 8px 18px;
  z-index: 10;
  pointer-events: none;

  p {
    margin: 0;
    color: #aaccee;
    font-size: 13px;
  }
}
</style>
