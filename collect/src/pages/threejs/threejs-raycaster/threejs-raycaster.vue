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
import { onMounted, onUnmounted, ref, nextTick } from 'vue';
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Color,
  Raycaster,
  Vector2,
  Vector3,
  Plane,
  Mesh,
  MeshStandardMaterial,
  MeshPhongMaterial,
  BoxGeometry,
  SphereGeometry,
  TorusKnotGeometry,
  CylinderGeometry,
  DirectionalLight,
  AmbientLight,
  GridHelper,
  AxesHelper,
  Intersection,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';

/*
 * ========================================================================
 *  模块：Three.js 3D 交互拾取与拖拽 (Raycaster + TransformControls)
 *  核心知识点：
 *    1. Raycaster —— 从相机发射射线检测与 3D 物体的交点
 *    2. 屏幕坐标归一化 —— 将鼠标像素坐标转为 NDC（Normalized Device Coordinates）
 *    3. Intersection 对象 —— 包含交点的 point、object、distance 等信息
 *    4. 材质高亮 —— hover 时切换 emissive 自发光，click 时切换选中态
 *    5. TransformControls —— 选中物体的平移/旋转/缩放 gizmo 操作手柄
 *    6. OrbitControls + TransformControls 共存 —— 需要在两者间智能切换响应
 *    7. Plane 投影拖拽 —— 将鼠标在屏幕的 2D 移动映射到 3D 平面上移动物体
 *    8. 键盘快捷键 —— W/E/R 切换 TransformControls 模式
 * ========================================================================
 */

// ---------- 类型定义 ----------

interface SelectableInfo {
  mesh: Mesh;
  originalMaterial: MeshStandardMaterial | MeshPhongMaterial;
  originalEmissive: number; // 保存原始自发光色，用于取消 hover
  name: string;
}

// ---------- 响应式状态 ----------

const canvasRef = ref<HTMLDivElement | null>(null);
const infoText = ref('点击物体即可选中，按住 Shift 拖拽移动');
const selectedName = ref('');

// ---------- 全局变量 ----------

let scene: Scene | null = null;
let camera: PerspectiveCamera | null = null;
let renderer: WebGLRenderer | null = null;
let orbitControls: OrbitControls | null = null;
let transformControls: TransformControls | null = null;
let raycaster: Raycaster | null = null;
let animationId = 0;

// 场景中的可交互物体列表
let selectableObjects: SelectableInfo[] = [];

// 拖拽相关
let dragPlane = new Plane(new Vector3(0, 1, 0), 0); // 默认水平面，用于投影拖拽
let dragOffset = new Vector3();
let isDragging = false;

// hover 相关
let hoveredObject: SelectableInfo | null = null;

// ---------- 工具函数 ----------

function log(msg: string, data?: unknown) {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = `[拾取拖拽] ${timestamp}`;
  if (data !== undefined) {
    console.log(`${prefix} ${msg}`, data);
  } else {
    console.log(`${prefix} ${msg}`);
  }
}

// 屏幕坐标 → NDC 归一化
// 鼠标在 canvas 中的像素坐标 (clientX, clientY) 转为 (-1, 1) 范围
function toNDC(clientX: number, clientY: number, canvas: HTMLCanvasElement): Vector2 {
  const rect = canvas.getBoundingClientRect();
  return new Vector2(
    ((clientX - rect.left) / rect.width) * 2 - 1, // x: 左边=-1, 右边=1
    -((clientY - rect.top) / rect.height) * 2 + 1, // y: 上边=1, 下边=-1 (注意 Y 轴翻转)
  );
}

/**
 * 通过 Raycaster 找到当前鼠标指向的最前面物体
 * @returns 交点信息或 null
 */
function raycastFromMouse(event: MouseEvent): Intersection | null {
  if (!raycaster || !camera || !renderer) return null;

  const ndc = toNDC(event.clientX, event.clientY, renderer.domElement);
  raycaster.setFromCamera(ndc, camera);

  // 只对 selectableObjects 中的 mesh 做检测
  const targets = selectableObjects.map((s) => s.mesh);
  const intersections = raycaster.intersectObjects(targets, false);

  log(`射线检测: NDC=(${ndc.x.toFixed(2)}, ${ndc.y.toFixed(2)}), 命中数=${intersections.length}`);

  return intersections.length > 0 ? intersections[0] : null;
}

// ---------- 交互状态管理 ----------

/**
 * 清除 hover 状态的物体
 */
function clearHover() {
  if (hoveredObject) {
    (hoveredObject.mesh.material as any)['emissive']?.set(hoveredObject.originalEmissive);
    hoveredObject = null;
  }
}

/**
 * 设置 hover 高亮
 */
function setHover(intersection: Intersection) {
  const obj = intersection.object;
  const info: any = selectableObjects.find((s) => s.mesh === obj);
  if (!info || hoveredObject === info) return;

  clearHover();

  hoveredObject = info(
    // 自发光设为淡蓝色，表示鼠标悬停
    info.mesh.material as any,
  )['emissive']?.set(0x224466);
  log(`Hover: "${info.name}"`);
}

/**
 * 选中物体（点击时触发）
 */
function selectObject(intersection: Intersection) {
  const obj = intersection.object;
  const info = selectableObjects.find((s) => s.mesh === obj);
  if (!info) return;

  log(`选中物体: "${info.name}"`);
  infoText.value = `✅ 已选中: ${info.name}`;
  selectedName.value = info.name;

  if (transformControls) {
    // 将 TransformControls gizmo 吸附到选中的物体上
    transformControls.attach(info.mesh);
    log('TransformControls 已附加到选中物体');
  }
}

// ---------- 鼠标事件处理 ----------

let mouseDownPos = new Vector2();
let mouseMoved = false;

function onMouseMove(event: MouseEvent) {
  const intersection = raycastFromMouse(event);

  if (intersection) {
    setHover(intersection);
  } else {
    clearHover();
  }

  // 拖拽中的物体：通过 Plane 投影更新位置
  if (isDragging && transformControls && transformControls.object) {
    const planeIntersection = new Vector3();
    raycaster!.ray.intersectPlane(dragPlane, planeIntersection);

    if (planeIntersection) {
      const newPos = planeIntersection.clone().add(dragOffset);
      transformControls.object.position.copy(newPos);
      log(`拖拽位置: (${newPos.x.toFixed(2)}, ${newPos.y.toFixed(2)}, ${newPos.z.toFixed(2)})`);
    }
  }

  if (event.buttons > 0) {
    mouseMoved = true;
  }
}

function onMouseDown(event: MouseEvent) {
  mouseDownPos.set(event.clientX, event.clientY);
  mouseMoved = false;

  // 左键 + Shift = 拖拽模式（不触发 orbitControls 旋转）
  if (event.button === 0 && event.shiftKey) {
    const intersection = raycastFromMouse(event);
    if (intersection) {
      const obj = intersection.object;
      const info = selectableObjects.find((s) => s.mesh === obj);
      if (info && transformControls) {
        transformControls.attach(info.mesh);

        // 计算拖拽偏移：物体中心到交点的向量
        const planeIntersection = new Vector3();
        raycaster!.ray.intersectPlane(dragPlane, planeIntersection);
        if (planeIntersection) {
          dragOffset.copy(info.mesh.position).sub(planeIntersection);
        }

        isDragging = true;
        // Shift+拖拽时禁用 OrbitControls，避免视角旋转
        orbitControls!.enabled = false;
        log(
          `开始拖拽: "${info.name}", offset=(${dragOffset.x.toFixed(2)}, ${dragOffset.y.toFixed(2)}, ${dragOffset.z.toFixed(2)})`,
        );
      }
    }
  }
}

function onMouseUp(event: MouseEvent) {
  // 如果是拖拽操作，不触发点击选择
  if (isDragging) {
    isDragging = false;
    orbitControls!.enabled = true;
    log('拖拽结束，OrbitControls 已恢复');
    return;
  }

  if (mouseMoved) return; // 鼠标移动过，不算点击

  // 左键单击 = 选中
  if (event.button === 0) {
    const intersection = raycastFromMouse(event);
    if (intersection) {
      selectObject(intersection);
    } else {
      // 点击空白处：取消选中
      if (transformControls) transformControls.detach();
      infoText.value = '点击物体即可选中，按住 Shift 拖拽移动';
      selectedName.value = '';
      log('取消选中（点击空白处）');
    }
  }
}

function onKeyDown(event: KeyboardEvent) {
  if (!transformControls) return;

  // W: 平移模式, E: 旋转模式, R: 缩放模式
  switch (event.key.toUpperCase()) {
    case 'W':
      transformControls.setMode('translate');
      log('TransformControls 模式切换为: 平移 (translate)');
      infoText.value = '当前模式: 平移 (W)';
      break;
    case 'E':
      transformControls.setMode('rotate');
      log('TransformControls 模式切换为: 旋转 (rotate)');
      infoText.value = '当前模式: 旋转 (E)';
      break;
    case 'R':
      transformControls.setMode('scale');
      log('TransformControls 模式切换为: 缩放 (scale)');
      infoText.value = '当前模式: 缩放 (R)';
      break;
    case 'ESCAPE':
      transformControls.detach();
      infoText.value = '已取消选中';
      selectedName.value = '';
      log('ESC 取消选中');
      break;
  }
}

// ---------- 构建场景 ----------

function createScene() {
  log('======== 构建 3D 交互拾取场景 ========');

  // ---- 场景 ----
  scene = new Scene();
  scene.background = new Color(0x1a1a2e);
  log('场景创建，背景色: #1a1a2e');

  // ---- 相机 ----
  camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(8, 6, 12);
  camera.lookAt(0, 0, 0);
  log(`相机初始化: position=(${camera.position.x}, ${camera.position.y}, ${camera.position.z})`);

  // ---- 渲染器 ----
  renderer = new WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true; // 开启阴影映射
  log('渲染器创建，阴影映射已启用');

  // ---- 辅助工具 ----
  // 网格地面：10x10 单位，每格 1 单位
  const grid = new GridHelper(10, 10, 0x335577, 0x222244);
  scene.add(grid);
  log('网格辅助线添加: size=10, divisions=10');

  // 坐标轴：红=X, 绿=Y, 蓝=Z（长 5 单位）
  const axes = new AxesHelper(5);
  scene.add(axes);
  log('坐标轴辅助线添加: 红(X) 绿(Y) 蓝(Z)');

  // ---- 灯光 ----
  // 环境光：提供基础亮度，避免暗面全黑
  const ambientLight = new AmbientLight(0x404060, 0.6);
  scene.add(ambientLight);
  log('环境光添加: color=#404060, intensity=0.6');

  // 方向光（主光源）：模拟太阳光，投射阴影
  const dirLight = new DirectionalLight(0xffffff, 1.0);
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
  log('方向光添加: position=(5,10,7), 阴影贴图=1024x1024');

  // ---- 可交互物体 ----
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
    mesh.castShadow = true; // 投射阴影
    mesh.receiveShadow = true; // 接收阴影
    mesh.name = name;
    mesh.userData = { selectable: true, originalColor: color };
    scene!.add(mesh);

    selectableObjects.push({
      mesh,
      originalMaterial: material,
      originalEmissive: 0x000000,
      name,
    });

    log(`物体添加: "${name}", position=(${position.x}, ${position.y}, ${position.z}), color=#${color.toString(16)}`);
  });

  log(`场景中共 ${selectableObjects.length} 个可交互物体`);
  log(`场景子对象总数: ${scene!.children.length}`);
}

// ---------- 初始化控制器 ----------

function initControllers() {
  log('---------- 初始化控制器 ----------');

  // OrbitControls: 旋转/缩放/平移场景视角
  orbitControls = new OrbitControls(camera!, renderer!.domElement);
  orbitControls.enableDamping = true;
  orbitControls.dampingFactor = 0.1;
  orbitControls.target.set(0, 0.5, 1);
  orbitControls.update();
  log('OrbitControls 初始化完成');

  // TransformControls: 选中物体的平移/旋转/缩放操作手柄
  transformControls = new TransformControls(camera!, renderer!.domElement);
  transformControls.setMode('translate'); // 默认平移模式
  transformControls.setSize(0.8); // gizmo 手柄大小
  transformControls.addEventListener('dragging-changed', (event) => {
    // TransformControls 拖拽时禁用 OrbitControls，防止冲突
    orbitControls!.enabled = !event.value;
    log(`TransformControls dragging: ${event.value}`);
  });

  // TransformControls 中的物体变化时，更新其在射线检测列表中的引用
  transformControls.addEventListener('objectChange', () => {
    log('选中物体的 transform 发生变化');
    if (transformControls!.object) {
      const obj = transformControls!.object as Mesh;
      const info = selectableObjects.find((s) => s.mesh === obj);
      if (info) {
        infoText.value = `🔄 ${info.name}: pos=(${obj.position.x.toFixed(2)}, ${obj.position.y.toFixed(2)}, ${obj.position.z.toFixed(2)})`;
      }
    }
  });

  // TransformControls 要加到 scene 中才能在渲染中出现 gizmo
  scene!.add(transformControls);
  log('TransformControls 已添加到场景, 默认模式=translate, size=0.8');

  // Raycaster: 用于射线检测
  raycaster = new Raycaster();
  // 设置检测精度阈值，避免检测到远处的微小交点
  raycaster.far = 30;
  log('Raycaster 初始化完成, far=30');
}

// ---------- 事件绑定 ----------

function bindEvents() {
  const canvas = renderer!.domElement;
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mouseup', onMouseUp);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('resize', onResize);
  log('所有事件监听器已绑定');
}

function unbindEvents() {
  const canvas = renderer?.domElement;
  if (canvas) {
    canvas.removeEventListener('mousemove', onMouseMove);
    canvas.removeEventListener('mousedown', onMouseDown);
    canvas.removeEventListener('mouseup', onMouseUp);
  }
  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('resize', onResize);
}

function onResize() {
  if (camera && renderer) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    log(`窗口尺寸变化: ${window.innerWidth}x${window.innerHeight}`);
  }
}

// ---------- 动画循环 ----------

function animate() {
  animationId = requestAnimationFrame(animate);

  orbitControls!.update();
  renderer!.render(scene!, camera!);
}

// ---------- 生命周期 ----------

onMounted(() => {
  log('组件挂载');
  nextTick(() => {
    createScene();
    initControllers();
    bindEvents();

    if (canvasRef.value && renderer) {
      canvasRef.value.appendChild(renderer.domElement);
      log('Canvas 已挂载到 DOM');
    }

    animate();
    log('======== 场景就绪，开始交互 ========');
  });
});

onUnmounted(() => {
  log('组件卸载，清理资源...');
  cancelAnimationFrame(animationId);
  unbindEvents();

  // 释放几何体和材质
  selectableObjects.forEach((s) => {
    s.mesh.geometry.dispose();
    s.originalMaterial.dispose();
  });
  selectableObjects = [];

  orbitControls?.dispose();
  transformControls?.dispose();

  if (renderer && canvasRef.value) {
    const canvas = renderer.domElement;
    if (canvas.parentNode === canvasRef.value) {
      canvasRef.value.removeChild(canvas);
    }
  }
  renderer?.dispose();
  log('所有资源已清理');
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
