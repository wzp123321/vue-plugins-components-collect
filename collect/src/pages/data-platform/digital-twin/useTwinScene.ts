/**
 * 数字孪生 —— 3D 场景
 * ============================================================================
 * 复用 threejs 的 useThreeScene 基建（renderer / camera / controls / resize / dispose），
 * 复用 three-iot-scene 的程序化设备几何与数据点定义，只补三件这里特有的事：
 *   1. 拾取：Raycaster 点选设备 → 回调给页面，驱动右侧图表联动；
 *   2. 选中反馈：设备脚下的脉冲光环 + 相机目标点平滑靠拢；
 *   3. 状态着色：按 TWIN_STATUS_COLOR 与图表同源，避免两套配色。
 *
 * 注意：拖动旋转时不应触发选中，所以用 pointerdown/pointerup 的位移阈值判断。
 */
import type { Ref } from 'vue';
import * as THREE from 'three';
import { useThreeScene, type ThreeSceneContext } from '@/pages/threejs/shared/useThreeScene';
import { buildDevice, DEVICE_POSITIONS, type DeviceInstance } from '@/components/three-iot-scene/src/devices';
import { TWIN_DEVICES, TWIN_STATUS_COLOR, deviceById, tagsOfDevice, type TwinStatus } from './twin-data';

export interface TwinSceneOptions {
  /** 点选设备（也用于图表反选时同步高亮，由页面调用 focus） */
  onSelect: (id: string) => void;
}

const DEFAULT_TARGET = new THREE.Vector3(0, 1.1, 0);
const DEFAULT_CAMERA = new THREE.Vector3(13, 10, 15);
/** 判定为「点击」而非「拖拽」的位移阈值（px） */
const CLICK_TOLERANCE = 6;

/** 不同状态下数据点相对正常值的放大系数，让异常设备在 3D 里明显偏离常态 */
const STATUS_VALUE_FACTOR: Record<TwinStatus, number> = {
  normal: 1,
  warn: 1.03,
  alarm: 1.1,
};

export const useTwinScene = (containerRef: Ref<HTMLElement | null>, options: TwinSceneOptions) => {
  const instances = new Map<string, DeviceInstance>();
  const rings = new Map<string, THREE.Mesh>();
  const anchors = new Map<string, THREE.Vector3>();
  const values = new Map<string, Record<string, number>>();
  const focusPoint = DEFAULT_TARGET.clone();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let world: THREE.Group | null = null;
  let unbindPick: (() => void) | null = null;
  let selectedId = TWIN_DEVICES[0].id;

  const buildWorld = (scene: THREE.Scene) => {
    scene.add(new THREE.AmbientLight(0x8fa4c8, 1.1));

    const key = new THREE.DirectionalLight(0xffffff, 1.9);
    key.position.set(12, 18, 10);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 60;
    scene.add(key);

    const rim = new THREE.DirectionalLight(0x7c5cff, 1.3);
    rim.position.set(-14, 8, -10);
    scene.add(rim);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(64, 64),
      new THREE.MeshStandardMaterial({ color: 0x0d1320, roughness: 0.92, metalness: 0.08 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const grid = new THREE.GridHelper(64, 64, 0x25304a, 0x161d2c);
    grid.position.y = 0.005;
    scene.add(grid);

    world = new THREE.Group();
    TWIN_DEVICES.forEach((device) => {
      const instance = buildDevice(device.kind);
      const [x, y, z] = DEVICE_POSITIONS[device.kind];
      instance.group.position.set(x, y, z);
      instance.group.userData.deviceId = device.id;
      world?.add(instance.group);
      instances.set(device.id, instance);
      anchors.set(device.id, new THREE.Vector3(x, y + 1.1, z));
      values.set(device.id, {});

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(1.62, 1.9, 64),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color(TWIN_STATUS_COLOR[device.status]),
          transparent: true,
          opacity: 0.9,
          side: THREE.DoubleSide,
        }),
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(x, 0.03, z);
      // 非正常状态的设备常亮状态环（颜色与右侧图表同源）；正常设备只在选中时点亮
      ring.visible = device.status !== 'normal';
      if (ring.visible) (ring.material as THREE.MeshBasicMaterial).opacity = 0.45;
      world?.add(ring);
      rings.set(device.id, ring);
    });
    scene.add(world);
  };

  /** 绑定拾取：拖动旋转不应触发选中，用 pointerdown/pointerup 的位移阈值判断 */
  const bindPicking = (context: ThreeSceneContext) => {
    const canvas = context.renderer.domElement;
    let downAt: { x: number; y: number } | null = null;

    const pickAt = (event: PointerEvent) => {
      if (!world) return;
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, context.camera);
      const hits = raycaster.intersectObjects(world.children, true);
      if (!hits.length) return;
      let node: THREE.Object3D | null = hits[0].object;
      while (node && !node.userData.deviceId) {
        node = node.parent;
      }
      const id = node?.userData.deviceId as string | undefined;
      if (id) options.onSelect(id);
    };

    const onPointerDown = (event: PointerEvent) => {
      downAt = { x: event.clientX, y: event.clientY };
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!downAt) return;
      const moved = Math.hypot(event.clientX - downAt.x, event.clientY - downAt.y);
      downAt = null;
      if (moved <= CLICK_TOLERANCE) pickAt(event);
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointerup', onPointerUp);

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
    };
  };

  const { ctx } = useThreeScene({
    containerRef,
    background: 0x080b14,
    shadowMap: true,
    camera: { fov: 45, position: [DEFAULT_CAMERA.x, DEFAULT_CAMERA.y, DEFAULT_CAMERA.z], lookAt: [0, 1.1, 0] },
    controls: {
      autoRotate: true,
      autoRotateSpeed: 0.45,
      minDistance: 7,
      maxDistance: 42,
      target: [DEFAULT_TARGET.x, DEFAULT_TARGET.y, DEFAULT_TARGET.z],
    },
    onInit: (context) => {
      buildWorld(context.scene);
      unbindPick = bindPicking(context);
    },
    onFrame: (context, delta, elapsed) => {
      TWIN_DEVICES.forEach((device, index) => {
        const instance = instances.get(device.id);
        const record = values.get(device.id);
        if (!instance || !record) return;
        const base = STATUS_VALUE_FACTOR[device.status];
        tagsOfDevice(device.id).forEach((tag, tagIndex) => {
          const wave = Math.sin(elapsed * 1.5 + index + tagIndex) * 0.02;
          record[tag.key] = tag.normal * base * (1 + wave);
        });
        instance.update(record, delta, device.status === 'alarm', elapsed);
      });

      // 状态环：选中设备脉冲高亮，非正常设备常亮微光，正常且未选中的隐藏
      rings.forEach((ring, id) => {
        const material = ring.material as THREE.MeshBasicMaterial;
        if (id === selectedId) {
          ring.visible = true;
          ring.scale.setScalar(1 + Math.sin(elapsed * 3.4) * 0.06);
          material.opacity = 0.65 + Math.sin(elapsed * 3.4) * 0.25;
          return;
        }
        ring.visible = deviceById(id).status !== 'normal';
        ring.scale.setScalar(1);
        material.opacity = 0.4;
      });

      // 相机目标平滑靠拢选中设备
      const controls = context.controls;
      controls.target.lerp(focusPoint, 0.08);
    },
    onDispose: () => {
      unbindPick?.();
      unbindPick = null;
    },
  });

  /** 高亮并聚焦某台设备（图表点击 / 设备列表点击都会走这里） */
  const focus = (id: string) => {
    selectedId = id;
    const anchor = anchors.get(id);
    if (anchor) focusPoint.copy(anchor);
    if (ctx.controls) ctx.controls.autoRotate = false;
    // 状态色写进光环，切换设备时颜色跟着状态走
    const ring = rings.get(id);
    const status = deviceById(id).status;
    if (ring) (ring.material as THREE.MeshBasicMaterial).color = new THREE.Color(TWIN_STATUS_COLOR[status]);
  };

  /** 回到默认视角 */
  const resetView = () => {
    focusPoint.copy(DEFAULT_TARGET);
    if (!ctx.camera || !ctx.controls) return;
    ctx.camera.position.copy(DEFAULT_CAMERA);
    ctx.controls.target.copy(DEFAULT_TARGET);
    ctx.controls.autoRotate = true;
  };

  return { focus, resetView };
};
