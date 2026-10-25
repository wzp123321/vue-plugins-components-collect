/**
 * IoT 组态 —— 3D 场景引擎（自包含）
 *
 * 职责：搭场景、建设备、挂 CSS2D 绑点标签、按数据总线平滑驱动运转动画与报警着色，
 *       并在组件卸载时全量 dispose（几何体/材质/纹理/控制器/渲染器/监听）。
 *
 * 颜色管线沿用站点约定：ColorManagement 已在 main 关闭，这里把 outputColorSpace 设回 LinearSRGB。
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { buildDevice, DEVICE_POSITIONS, type DeviceInstance } from './devices';
import {
  dataBus,
  onTick,
  alarmsByDevice,
  deviceStatus,
  DEVICES,
  TAGS,
  fmt,
  type Scenario,
} from '../dataBus';

const STATUS_COLOR: Record<string, string> = {
  运行: '#37e07a',
  告警: '#ff5a3c',
  待机: '#9aa7bd',
};

interface LabelRef {
  id: string;
  el: HTMLDivElement;
}

export interface IotSceneHandle {
  setScenario: (s: Scenario) => void;
  resetView: () => void;
  setAutoRotate: (on: boolean) => void;
  dispose: () => void;
}

export const createIotScene = (container: HTMLElement): IotSceneHandle => {
  const width = () => container.clientWidth || 800;
  const height = () => container.clientHeight || 600;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width(), height());
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  const css2d = new CSS2DRenderer();
  css2d.setSize(width(), height());
  const cssDom = css2d.domElement;
  cssDom.style.position = 'absolute';
  cssDom.style.top = '0';
  cssDom.style.left = '0';
  cssDom.style.pointerEvents = 'none';
  container.appendChild(cssDom);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b1020);
  scene.fog = new THREE.FogExp2(0x0b1020, 0.012);

  const camera = new THREE.PerspectiveCamera(50, width() / height(), 0.1, 200);
  camera.position.set(11, 8, 13);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.target.set(0, 1.3, 0);
  controls.minDistance = 6;
  controls.maxDistance = 40;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.6;

  // 灯光
  scene.add(new THREE.HemisphereLight(0x9fc0ff, 0x202830, 0.65));
  const dir = new THREE.DirectionalLight(0xffffff, 1.25);
  dir.position.set(9, 14, 7);
  dir.castShadow = true;
  dir.shadow.mapSize.set(2048, 2048);
  dir.shadow.camera.near = 1;
  dir.shadow.camera.far = 60;
  const sc = dir.shadow.camera as THREE.OrthographicCamera;
  sc.left = -20;
  sc.right = 20;
  sc.top = 20;
  sc.bottom = -20;
  scene.add(dir);
  const p1 = new THREE.PointLight(0x39e0ff, 0.5, 40);
  p1.position.set(-8, 4, 6);
  scene.add(p1);
  const p2 = new THREE.PointLight(0xff7a3c, 0.4, 40);
  p2.position.set(8, 4, -4);
  scene.add(p2);

  // 地面 + 网格
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 80),
    new THREE.MeshStandardMaterial({ color: 0x0e1420, metalness: 0.1, roughness: 0.95 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  const grid = new THREE.GridHelper(80, 80, 0x2a3a55, 0x16202f);
  (grid.material as THREE.Material).transparent = true;
  (grid.material as THREE.Material).opacity = 0.5;
  grid.position.y = 0.01;
  scene.add(grid);

  // 设备
  const devices: { id: string; inst: DeviceInstance }[] = [];
  const labels: LabelRef[] = [];
  DEVICES.forEach((d) => {
    const inst = buildDevice(d.kind);
    const [x, y, z] = DEVICE_POSITIONS[d.kind];
    inst.group.position.set(x, y, z);
    scene.add(inst.group);
    devices.push({ id: d.id, inst });

    const el = document.createElement('div');
    Object.assign(el.style, {
      padding: '6px 9px',
      borderRadius: '8px',
      background: 'rgba(12,18,30,0.82)',
      border: '1px solid rgba(120,160,220,0.35)',
      color: '#dbe6f5',
      font: '12px/1.5 ui-monospace, Menlo, Consolas, monospace',
      whiteSpace: 'nowrap',
      backdropFilter: 'blur(2px)',
      boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
    } as CSSStyleDeclaration);
    const obj = new CSS2DObject(el);
    obj.position.copy(inst.labelOffset);
    inst.group.add(obj);
    labels.push({ id: d.id, el });
  });

  const refreshLabels = () => {
    labels.forEach((ref) => {
      const def = DEVICES.find((d) => d.id === ref.id)!;
      const st = deviceStatus.value[ref.id] || '运行';
      const color = STATUS_COLOR[st] || '#9aa7bd';
      const alarm = alarmsByDevice.value[ref.id];
      const rows = def.bindings
        .map((b) => {
          const t = TAGS.find((x) => x.key === b.tag)!;
          return `<div style="opacity:.92">${t.label}：${fmt(b.tag)}</div>`;
        })
        .join('');
      ref.el.style.borderColor = alarm ? '#ff5a3c' : 'rgba(120,160,220,0.35)';
      ref.el.style.boxShadow = alarm ? '0 0 14px rgba(255,90,60,0.55)' : '0 4px 14px rgba(0,0,0,0.4)';
      ref.el.innerHTML =
        `<div style="display:flex;align-items:center;gap:6px;font-weight:600;margin-bottom:2px">` +
        `<span style="width:8px;height:8px;border-radius:50%;background:${color};box-shadow:0 0 8px ${color}"></span>` +
        `${def.name}</div>${rows}` +
        `<div style="margin-top:2px;color:${color}">状态：${st}</div>`;
    });
  };

  // 平滑可视值（数据总线 600ms 跳变，这里逐帧插值，运动更顺）
  const visual: Record<string, number> = {};
  TAGS.forEach((t) => {
    visual[t.key] = dataBus.values[t.key];
  });

  const clock = new THREE.Clock();
  let time = 0;
  let raf = 0;
  const animate = () => {
    raf = requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    time += dt;
    const k = Math.min(1, dt * 4);
    TAGS.forEach((t) => {
      visual[t.key] += (dataBus.values[t.key] - visual[t.key]) * k;
    });
    devices.forEach((d) => d.inst.update(visual, dt, !!alarmsByDevice.value[d.id], time));
    controls.update();
    renderer.render(scene, camera);
    css2d.render(scene, camera);
  };
  animate();

  const offTick = onTick(refreshLabels);
  refreshLabels();

  const onResize = () => {
    const w = width();
    const h = height();
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    css2d.setSize(w, h);
  };
  const ro = new ResizeObserver(onResize);
  ro.observe(container);

  const initialCam = camera.position.clone();
  const initialTarget = controls.target.clone();

  return {
    setScenario: (s) => {
      dataBus.scenario = s;
      refreshLabels();
    },
    resetView: () => {
      camera.position.copy(initialCam);
      controls.target.copy(initialTarget);
      controls.update();
    },
    setAutoRotate: (on) => {
      controls.autoRotate = on;
    },
    dispose: () => {
      cancelAnimationFrame(raf);
      offTick();
      ro.disconnect();
      controls.dispose();
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else if (mat) mat.dispose();
        if (obj instanceof CSS2DObject) obj.element.remove();
      });
      renderer.dispose();
      renderer.domElement.remove();
      cssDom.remove();
    },
  };
};
