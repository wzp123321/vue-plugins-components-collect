import { onBeforeUnmount, onMounted, type Ref } from 'vue';
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Color,
  Clock,
  Object3D,
  Material,
  BufferGeometry,
  LinearSRGBColorSpace,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface ThreeSceneContext {
  scene: Scene;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  controls: OrbitControls;
  clock: Clock;
  container: HTMLElement;
}

export interface UseThreeSceneOptions {
  containerRef: Ref<HTMLElement | null>;
  /** 场景背景色 */
  background?: number;
  /** 渲染器透明背景（默认不透明） */
  alpha?: boolean;
  /** 开启阴影映射 */
  shadowMap?: boolean;
  camera?: {
    fov?: number;
    position?: [number, number, number];
    near?: number;
    far?: number;
    lookAt?: [number, number, number];
  };
  controls?: {
    enableDamping?: boolean;
    dampingFactor?: number;
    autoRotate?: boolean;
    autoRotateSpeed?: number;
    minDistance?: number;
    maxDistance?: number;
    target?: [number, number, number];
  };
  /** 构建场景内容（灯光 / 物体 / 辅助器），在 renderer 就绪后调用 */
  onInit?: (ctx: ThreeSceneContext) => void;
  /** 每帧回调（composable 已负责 controls.update + render，请勿重复调用） */
  onFrame?: (ctx: ThreeSceneContext, delta: number, elapsed: number) => void;
  /** 容器尺寸变化（相机与渲染器已自动适配，此回调用于额外处理） */
  onResize?: (ctx: ThreeSceneContext) => void;
  /** 卸载清理（场景内几何体 / 材质已由 composable 统一释放，此处处理自定义资源） */
  onDispose?: (ctx: ThreeSceneContext) => void;
}

/**
 * three.js 场景基础设施共用 composable。
 *
 * 统一负责：renderer / camera / OrbitControls / Clock 创建、容器尺寸自适应
 * （ResizeObserver，跟随父容器而非 window）、requestAnimationFrame 循环，以及
 * 卸载时的资源释放（dispose 场景内几何体 / 材质 + 控制器 + 渲染器）。
 * 各 demo 只需提供 onInit / onFrame 等回调描述自己的场景内容，不再重复基建样板。
 */
export const useThreeScene = (options: UseThreeSceneOptions) => {
  const ctx: Partial<ThreeSceneContext> = {};
  let rafId = 0;
  let resizeObserver: ResizeObserver | null = null;

  const containerSize = () => {
    const el = options.containerRef.value;
    return { w: el?.clientWidth || 800, h: el?.clientHeight || 600 };
  }

  const applyResize = () => {
    if (!ctx.camera || !ctx.renderer) return;
    const { w, h } = containerSize();
    ctx.camera.aspect = w / h;
    ctx.camera.updateProjectionMatrix();
    ctx.renderer.setSize(w, h);
    options.onResize?.(ctx as ThreeSceneContext);
  }

  const disposeScene = () => {
    ctx.scene?.traverse((obj: Object3D) => {
      const mesh = obj as Object3D & {
        geometry?: BufferGeometry;
        material?: Material | Material[];
      };
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m) => m.dispose());
      }
    });
  }

  const animate = () => {
    rafId = requestAnimationFrame(animate);
    if (!ctx.clock || !ctx.renderer || !ctx.scene || !ctx.camera || !ctx.controls) return;
    const delta = ctx.clock.getDelta();
    const elapsed = ctx.clock.getElapsedTime();
    options.onFrame?.(ctx as ThreeSceneContext, delta, elapsed);
    ctx.controls.update();
    ctx.renderer.render(ctx.scene, ctx.camera);
  }

  onMounted(() => {
    const el = options.containerRef.value;
    if (!el) return;
    const { w, h } = containerSize();

    ctx.container = el;
    ctx.scene = new Scene();
    ctx.scene.background = new Color(options.background ?? 0x0b0e1a);

    const cam = options.camera ?? {};
    ctx.camera = new PerspectiveCamera(cam.fov ?? 50, w / h, cam.near ?? 0.1, cam.far ?? 100);
    const pos = cam.position ?? [0, 0, 5];
    ctx.camera.position.set(pos[0], pos[1], pos[2]);
    if (cam.lookAt) ctx.camera.lookAt(cam.lookAt[0], cam.lookAt[1], cam.lookAt[2]);

    ctx.renderer = new WebGLRenderer({ antialias: true, alpha: options.alpha ?? false });
    // 配套 src/three-compat.ts：与关闭的 ColorManagement 保持一致的旧输出管线
    ctx.renderer.outputColorSpace = LinearSRGBColorSpace;
    ctx.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    ctx.renderer.setSize(w, h);
    if (options.shadowMap) ctx.renderer.shadowMap.enabled = true;
    el.appendChild(ctx.renderer.domElement);

    const cc = options.controls ?? {};
    ctx.controls = new OrbitControls(ctx.camera, ctx.renderer.domElement);
    ctx.controls.enableDamping = cc.enableDamping ?? true;
    ctx.controls.dampingFactor = cc.dampingFactor ?? 0.08;
    ctx.controls.autoRotate = cc.autoRotate ?? false;
    ctx.controls.autoRotateSpeed = cc.autoRotateSpeed ?? 1.0;
    if (cc.minDistance !== undefined) ctx.controls.minDistance = cc.minDistance;
    if (cc.maxDistance !== undefined) ctx.controls.maxDistance = cc.maxDistance;
    if (cc.target) ctx.controls.target.set(cc.target[0], cc.target[1], cc.target[2]);
    ctx.controls.update();

    ctx.clock = new Clock();

    options.onInit?.(ctx as ThreeSceneContext);

    resizeObserver = new ResizeObserver(() => applyResize());
    resizeObserver.observe(el);

    animate();
  });

  onBeforeUnmount(() => {
    cancelAnimationFrame(rafId);
    resizeObserver?.disconnect();
    resizeObserver = null;
    options.onDispose?.(ctx as ThreeSceneContext);
    disposeScene();
    ctx.controls?.dispose();
    if (ctx.renderer && ctx.container) {
      const canvas = ctx.renderer.domElement;
      if (canvas.parentNode === ctx.container) ctx.container.removeChild(canvas);
      ctx.renderer.dispose();
    }
  });

  return { ctx: ctx as ThreeSceneContext };
}
