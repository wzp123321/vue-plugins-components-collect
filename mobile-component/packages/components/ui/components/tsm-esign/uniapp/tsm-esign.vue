<template>
  <view class="tsm-esign" :class="[customClass]" :style="[customStyle]">
    <!-- 签名展示区 -->
    <view
      class="tsm-esign__area"
      :class="{ 'tsm-esign__area--readonly': isReadonly }"
      :style="areaStyle"
      @tap="onAreaTap"
    >
      <image v-if="displaySrc" :src="displaySrc" class="tsm-esign__image" mode="aspectFit" />
      <view v-else class="tsm-esign__placeholder" :class="{ 'tsm-esign__placeholder--readonly': isReadonly }">
        {{ placeholderText }}
      </view>
    </view>

    <!-- 全屏签名编辑层 -->
    <!-- #ifdef H5 -->
    <!-- 默认挂到 body：页面内含 transform/overflow 的祖先会形成包含块，页面内的 fixed 编辑层会被裁剪
         或被导航条·状态栏盖住（iOS 上尤其明显）；teleportToBody=false 时退回页面内渲染。
         小程序 / App 运行时没有 Teleport，整段在编译期剔除 -->
    <Teleport to="body" :disabled="!teleportToBody">
      <tsm-theme-provider>
        <!-- #endif -->
        <view v-if="editorVisible" :id="editorRootId" class="tsm-esign__overlay" @touchmove.stop.prevent>
          <!-- 真横屏：顶部栏正常渲染（← 返回 / 标题），下方白板旋转模拟横屏 -->
          <view v-if="isRot" class="tsm-esign__rot">
            <!-- 顶部栏整体下移 landscapeTopInset，避开系统状态栏／遗留时间显示 -->
            <view class="tsm-esign__rot-top" :style="{ height: rotTopTotal + 'px', paddingTop: safeTop + 'px' }">
              <view class="tsm-esign__rot-top-back" @tap="onCancel">
                <view class="tsm-esign__header-back"></view>
              </view>
              <text class="tsm-esign__header-title">{{ editorTitle }}</text>
              <view class="tsm-esign__rot-top-right" />
            </view>

            <view class="tsm-esign__rot-board-host">
              <view class="tsm-esign__rot-board" :style="rotBoxStyle">
                <view class="tsm-esign__rot-main">
                  <view class="tsm-esign__rot-area" :style="{ padding: rotPadY + 'px ' + rotPadX + 'px' }">
                    <view
                      class="tsm-esign__canvas-box tsm-esign__canvas-box--rot"
                      :style="{ background: backgroundColor }"
                    >
                      <canvas
                        v-if="canvasReady"
                        :canvas-id="canvasId"
                        class="tsm-esign__canvas"
                        :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
                        @touchstart="onTouchStart"
                        @touchmove="onTouchMove"
                        @touchend="onTouchEnd"
                        @touchcancel="onTouchEnd"
                      />
                      <text v-if="!hasInk && canvasReady" class="tsm-esign__canvas-hint">{{ hintText }}</text>
                    </view>
                  </view>

                  <view
                    class="tsm-esign__rot-footer"
                    :style="{ height: rotFootH + 'px', padding: '0 ' + rotPadX + 'px' }"
                  >
                    <tsm-button type="outline" theme="default" :label="clearText" @click="onClear" />
                    <tsm-button type="solid" theme="primary" :label="confirmText" @click="onConfirm" />
                  </view>
                </view>
              </view>
            </view>
          </view>

          <!-- 常规（竖/横 自然排版） -->
          <view v-else class="tsm-esign__normal" :style="normalBoxStyle">
            <view class="tsm-esign__header">
              <view class="tsm-esign__header-cancel" @tap="onCancel">
                <view class="tsm-esign__header-back"></view>
              </view>
              <text class="tsm-esign__header-title">{{ editorTitle }}</text>
              <view class="tsm-esign__header-right" />
            </view>

            <view class="tsm-esign__body">
              <view class="tsm-esign__canvas-area">
                <view class="tsm-esign__canvas-box" :style="{ background: backgroundColor }">
                  <canvas
                    v-if="canvasReady"
                    :canvas-id="canvasId"
                    class="tsm-esign__canvas"
                    :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
                    @touchstart="onTouchStart"
                    @touchmove="onTouchMove"
                    @touchend="onTouchEnd"
                    @touchcancel="onTouchEnd"
                  />
                  <text v-if="!hasInk && canvasReady" class="tsm-esign__canvas-hint">{{ hintText }}</text>
                </view>
              </view>
            </view>

            <view class="tsm-esign__footer">
              <tsm-button type="outline" theme="default" :label="clearText" @click="onClear" />
              <tsm-button type="solid" theme="primary" :label="confirmText" @click="onConfirm" />
            </view>
          </view>
        </view>
      </tsm-theme-provider>
      <!-- #ifdef H5 -->
    </Teleport>
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { CSSProperties } from 'vue';
import type { EsignProps } from './props';
import { defaultProps } from './props';

const props = withDefaults(defineProps<EsignProps>(), defaultProps);

const emit = defineEmits<{
  'update:modelValue': [value: string];
  change: [value: string];
  confirm: [value: string];
  clear: [];
  cancel: [];
  /** 横屏签字态变化（进入/退出旋转横屏签名），参数为当前是否处于横屏签字 */
  'esign-landscape-change': [value: boolean];
}>();

// Inject FormItem 上下文（默认 null，独立使用时正常）
const formItemContext = inject<any | null>('formItemContext', null);

// ================= 平台探测 =================
let isH5 = false;
// #ifdef H5
isH5 = true;
// #endif

// ================= 展示区 =================
// 只读状态：自身 readonly 或 FormItem（合并 Form 的 readonly）
const isReadonly = computed(() => props.readonly || formItemContext?.readonly);

/**
 * 回显 src：兼容 图片URL / 本地临时路径 / data: 前缀 base64 / 裸 base64
 */
const displaySrc = computed(() => {
  const v = (props.modelValue || '').trim();
  if (!v) return '';
  if (
    /^data:image\//.test(v) ||
    /^(https?:)?\/\//.test(v) ||
    v.startsWith('blob:') ||
    v.startsWith('/') ||
    /^[A-Za-z]:[\\/]/.test(v)
  ) {
    return v;
  }
  // 剩余情况按裸 base64 处理（URL/路径不会只包含 base64 字符且较短）
  if (/^[A-Za-z0-9+/]+={0,2}$/.test(v) && v.length > 100) {
    return `data:image/png;base64,${v}`;
  }
  return v;
});

/**
 * 只读且未签名：展示区只留一个占位符，不撑高度也不铺底色。
 * 此时没有签名图，若仍保留 300rpx 的空板 + 主色祈使文案，看起来就是个可点击的入口。
 */
const isEmptyReadonly = computed(() => isReadonly.value && !displaySrc.value);

/** 展示区样式：只读空态下不注入高度与底色，避免留下一块像按钮的空板 */
const areaStyle = computed<CSSProperties>(() => {
  if (isEmptyReadonly.value) return {};
  return { height: props.height, background: props.backgroundColor };
});

/** 未签名时的展示文案：只读态用中性占位符，不再用「点击…」这类祈使句 */
const placeholderText = computed(() => (isReadonly.value ? '-' : props.placeholder));

// ================= 编辑层状态 =================
const instance = getCurrentInstance();
const uid = instance?.uid ?? 0;
const canvasId = `tsmEsign_${uid}`;
/**
 * 编辑器根节点 id。
 * 编辑层 Teleport 到 body 后不再位于组件 `$el` 之内，而 uni 的
 * `createSelectorQuery().in(proxy)` 是按 `vm.$el` 限定查询作用域的，查不到就只会空转重试；
 * 故 H5 下改用该 id 从文档里锚定本次实例的编辑器节点。
 */
const editorRootId = `tsmEsignEditor_${uid}`;
const editorVisible = ref(false);
const canvasReady = ref(false);
const canvasWidth = ref(0);
const canvasHeight = ref(0);
const hasInk = ref(false);

let ctx: UniApp.CanvasContext | null = null;
let drawing = false;
let lastX = 0;
let lastY = 0;
let canvasRect: { left: number; top: number } | null = null;
let lastTouchAt = 0; // 触摸后短时间忽略鼠标（防止移动端合成 mouse 事件重复绘制）
// H5 下缓存真实 <canvas> 宿主元素，用于绘制时实时读取画布位置（旋转时仅作容器，坐标走纯数学映射）
let h5CanvasEl: Element | null = null;
const getH5CanvasEl = () => {
  if (!isH5 || typeof document === 'undefined') return null;
  if (h5CanvasEl && (h5CanvasEl as HTMLElement).isConnected) return h5CanvasEl;
  h5CanvasEl = document.querySelector(`uni-canvas[canvas-id="${canvasId}"]`) || null;
  return h5CanvasEl;
};
/** H5 下真实的绘制 canvas（墨迹实际所在的位置） */
const getH5InnerCanvas = (): HTMLCanvasElement | null => {
  const host = getH5CanvasEl();
  if (!host) return null;
  return host.querySelector('canvas') || null;
};

// 真横屏几何（仅 H5 竖屏使用）
const viewW = ref(0); // 视口宽 px（= 旋转层高）
const viewH = ref(0); // 视口高 px（= 旋转层宽）
const isRot = ref(false);
// 旋转分支布局参数（顶部栏 + 旋转板）
const rotTopH = ref(0); // 顶部正常栏高（不旋转：← 返回 / 标题）
const rotFootH = ref(0); // 旋转板内底部按钮行高（随板旋转）
const rotPadX = ref(0); // 旋转板内水平内边距（画布长边方向）
const rotPadY = ref(0); // 旋转板内垂直内边距（画布短边方向）

/**
 * 顶部安全区预留高度(px)：旋转分支的顶部栏整体下移这么多，用于避开系统状态栏／刘海。
 * 常规分支靠 normalBoxStyle 预留 statusBarHeight，旋转分支拿不到该值（H5 build 下 uni 恒报 0），
 * 故改由页面通过 landscapeTopInset 注入。
 */
const safeTop = computed(() => Math.max(0, Math.round(Number(props.landscapeTopInset) || 0)));
/** 旋转分支顶部栏总高 = 安全区预留 + 正常栏高；旋转板自其下方起算 */
const rotTopTotal = computed(() => safeTop.value + rotTopH.value);

const isPortraitViewport = (winW: number, winH: number) => winH > winW && winH > 0 && winW > 0;

// ================= 对外状态：是否横屏签字 =================
/**
 * 是否处于横屏签字态：编辑层已打开 且 走旋转横屏方案。
 * 说明：仅 H5 竖屏下会把签名板旋转 90° 模拟横屏；窗口本身为横屏 / 非 H5 端走常规分支，
 * 该分支画布是自然方向排版，不算「横屏签字态」。
 */
const isLandscape = computed(() => editorVisible.value && isRot.value);

watch(isLandscape, val => {
  emit('esign-landscape-change', val);
});

// ================= 尺寸/上下文初始化 =================
/**
 * 按当前视口刷新 viewW/viewH 与旋转分支布局。
 * H5 竖屏 → 旋转横屏（viewW/viewH 取真实 window 尺寸）；横屏窗口 / 其它端 → 自然排版。
 */
const syncViewport = () => {
  let winW = 0;
  let winH = 0;
  try {
    const info: any = uni.getSystemInfoSync();
    winW = info.windowWidth || 0;
    winH = info.windowHeight || 0;
  } catch (e) {
    /* ignore */
  }
  const rot = isH5 && isPortraitViewport(winW, winH) && typeof window !== 'undefined';
  if (rot) {
    winW = window.innerWidth || winW;
    winH = window.innerHeight || winH;
  }
  const changed = winW !== viewW.value || winH !== viewH.value;
  viewW.value = winW;
  viewH.value = winH;
  isRot.value = rot;
  if (rot) layoutRot();
  return changed;
};

const openEditor = () => {
  if (isReadonly.value) return;
  hasInk.value = false;
  canvasReady.value = false;
  canvasRect = null;

  // H5 竖屏 → 整层旋转为横屏；横屏窗口 / 其它端 → 自然排版
  syncViewport();

  editorVisible.value = true;
  nextTick(() => {
    measureCanvas();
  });
};

const closeEditor = () => {
  editorVisible.value = false;
  canvasReady.value = false;
  drawing = false;
  ctx = null;
  canvasRect = null;
  if (vpTimer) {
    clearTimeout(vpTimer);
    vpTimer = null;
  }
};

/** 计算旋转分支布局参数（顶部正常栏 + 下方旋转板） */
const layoutRot = () => {
  const W = viewH.value; // 竖屏视口高（= 旋转板内容长边 CW = 视口高 - 顶部栏高）
  const H = viewW.value; // 竖屏视口宽（= 旋转板内容短边）
  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
  rotTopH.value = clamp(Math.round(W * 0.07), 44, 64); // 顶部正常栏高
  rotFootH.value = clamp(Math.round(H * 0.16), 52, 72); // 旋转板内底部按钮行高
  rotPadX.value = clamp(Math.round(W * 0.015), 10, 16); // 板内水平内边距（小留白，不随大屏继续放大）
  rotPadY.value = clamp(Math.round(H * 0.025), 8, 12); // 板内垂直内边距
};

const rotBoxStyle = computed(() => {
  if (!isRot.value) return {};
  // 旋转板：铺满「顶部栏以下」区域。内容(长 CW x 短 CH) 绕左上角旋转 90°。
  // CW = 视口高 - 顶部栏总高(含安全区预留)，CH = 视口宽(=390)。以 left=CH、top=0 定位即可铺满宿主。
  // 坐标映射（内容 u:长边 v:短边 → 宿主 x,y）：x = CH - v, y = u（宿主 y 起点即顶部栏之下）
  const CH = viewW.value; // 内容短边 = 竖屏视口宽
  const CW = viewH.value - rotTopTotal.value; // 内容长边 = 顶部栏以下的高度
  return {
    position: 'absolute',
    left: CH + 'px',
    top: '0px',
    width: CW + 'px',
    height: CH + 'px',
    'transform-origin': '0 0',
    transform: 'rotate(90deg)',
    background: '#FFFFFF',
  } as Record<string, string>;
});

const normalBoxStyle = computed(() => {
  let padTop = '0px';
  let padBottom = '0px';
  if (!isRot.value) {
    try {
      const info: any = uni.getSystemInfoSync();
      const sb = (info.statusBarHeight as number) || 0;
      const safeBottom = (info.safeAreaInsets && info.safeAreaInsets.bottom) || 0;
      padTop = sb + 'px';
      padBottom = safeBottom + 'px';
    } catch (e) {
      /* ignore */
    }
  }
  return { 'padding-top': padTop, 'padding-bottom': padBottom } as Record<string, string>;
});

/**
 * 测量编辑器内部元素。
 * H5：以 editorRootId 锚定做原生查询（teleport 到 body 后 uni 的组件作用域查询会失效）；
 * 其余端：沿用组件作用域的 uni 选择器查询，返回结构与 boundingClientRect 一致。
 */
const measureEditorRect = (selector: string, cb: (rect: any) => void) => {
  if (isH5 && typeof document !== 'undefined') {
    const host = document.getElementById(editorRootId);
    const el = host ? host.querySelector(selector) : null;
    if (!el) {
      cb(null);
      return;
    }
    const r = (el as HTMLElement).getBoundingClientRect();
    cb({ width: r.width, height: r.height, left: r.left, top: r.top });
    return;
  }
  uni.createSelectorQuery().in(instance?.proxy).select(selector).boundingClientRect(cb).exec();
};

const measureCanvas = () => {
  if (isRot.value) {
    // 旋转分支：画布尺寸由「顶部栏 + 旋转板」几何直接推导，无需 DOM 测量
    // 长边（内容 u 向）= CW - padX*2；短边（内容 v 向）= CH - padY*2 - footH
    const w = Math.floor(viewH.value - rotTopTotal.value - rotPadX.value * 2);
    const h = Math.floor(viewW.value - rotPadY.value * 2 - rotFootH.value);
    if (w > 200 && h > 80) {
      canvasWidth.value = w;
      canvasHeight.value = h;
      nextTick(initCanvas);
    } else {
      setTimeout(measureCanvas, 50);
    }
    return;
  }

  // 常规分支：测量可用区域
  measureEditorRect('.tsm-esign__canvas-area', (res: any) => {
    if (res && res.width > 0) {
      const areaWidth = res.width;
      const areaHeight = res.height;
      const w = Math.floor(areaWidth);
      const h = Math.max(80, Math.min(Math.floor(areaHeight), Math.floor(areaWidth * 0.5)));
      canvasWidth.value = w;
      canvasHeight.value = h;
      nextTick(initCanvas);
    } else {
      setTimeout(measureCanvas, 50);
    }
  });
};

const initCanvas = () => {
  canvasReady.value = true;
  nextTick(() => {
    if (!isRot.value) {
      measureEditorRect('.tsm-esign__canvas', (res: any) => {
        if (res) {
          canvasRect = { left: res.left, top: res.top };
        }
      });
    }
    ctx = uni.createCanvasContext(canvasId, instance?.proxy);
    if (ctx) {
      ctx.setLineWidth(props.lineWidth ?? 3);
      ctx.setStrokeStyle(props.penColor || '#181D27');
      ctx.setLineCap('round');
      ctx.setLineJoin('round');
    }
    // 尺寸重算会清空位图，此时把重算前捕获的墨迹按新尺寸回填
    const ink = pendingInk;
    pendingInk = null;
    if (ink) {
      nextPaint(() => {
        if (!ctx || !editorVisible.value) return;
        try {
          ctx.drawImage(ink, 0, 0, canvasWidth.value, canvasHeight.value);
          ctx.draw(true);
        } catch (e) {
          /* 回填失败仅丢失预览，不影响后续签名 */
        }
      });
    }
  });
};

// ================= 视口变化重算（状态栏显隐 / 转屏 / 键盘） =================
/**
 * openEditor 里的视口尺寸是「点击那一刻」的快照，画布与旋转板都据此推导。
 * 若调用方在 esign-landscape-change 回调里再切状态栏（原生异步生效），
 * 快照就已过期，且组件原本没有任何 resize 监听 → 按旧视口排版、被新视口裁掉。
 * 这里在编辑层打开期间监听视口变化并延迟重算，让布局自愈。
 */
let vpTimer: ReturnType<typeof setTimeout> | null = null;
let pendingInk: string | null = null;

/** 等浏览器真正落一帧（uni-h5 把位图同步到新尺寸后再回填） */
const nextPaint = (fn: () => void) => {
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(() => requestAnimationFrame(fn));
  } else {
    setTimeout(fn, 32);
  }
};

/** 捕获当前墨迹位图；非 H5 无法同步读取，返回 null */
const captureInk = (): string | null => {
  const inner = getH5InnerCanvas();
  if (!inner) return null;
  try {
    return inner.toDataURL('image/png');
  } catch (e) {
    return null;
  }
};

const applyViewportResize = () => {
  vpTimer = null;
  if (!editorVisible.value) return;
  // 正在落笔时不动画布，避免打断笔画
  if (drawing) {
    vpTimer = setTimeout(applyViewportResize, 150);
    return;
  }
  const ink = hasInk.value ? captureInk() : null;
  // 有墨迹又读不到位图（非 H5）时保持原尺寸，避免重算把已签内容清没
  if (hasInk.value && !ink) return;
  pendingInk = ink;
  syncViewport();
  measureCanvas();
};

const onViewportResize = () => {
  if (!editorVisible.value) return;
  if (vpTimer) clearTimeout(vpTimer);
  vpTimer = setTimeout(applyViewportResize, 150);
};

/**
 * 页面注入的安全区变化时同步重算：rotBoxStyle 是 computed 会立刻用新值，
 * 而画布尺寸由 measureCanvas 显式算出，不跟着重算两者会错位。
 */
watch(safeTop, onViewportResize);

// ================= 坐标换算 =================
/** 屏幕坐标(viewport px) → 画布本地坐标 */
const getLocalPoint = (clientX: number, clientY: number) => {
  if (isRot.value && viewW.value > 0) {
    // 旋转板内坐标：u = clientY - 顶部栏总高(含安全区)；v = CH - clientX（CH=视口宽）
    // 画布本地扣除内边距 padX(长边) / padY(短边)
    const SW = viewW.value;
    const topH = rotTopTotal.value;
    return { x: clientY - topH - rotPadX.value, y: SW - clientX - rotPadY.value };
  }
  // H5 实时读取画布真实位置（避免 v-if 刚显示时测量过早偏移）
  const el = getH5CanvasEl();
  if (el) {
    const r = (el as HTMLElement).getBoundingClientRect();
    return { x: clientX - r.left, y: clientY - r.top };
  }
  if (canvasRect && typeof clientX === 'number') {
    return { x: clientX - canvasRect.left, y: clientY - canvasRect.top };
  }
  return null;
};

/** uni 触摸事件 → 画布本地坐标 */
const getPointFromEvent = (e: any) => {
  const t = e && e.touches && e.touches[0];
  if (t && typeof t.clientX === 'number') {
    return getLocalPoint(t.clientX, t.clientY);
  }
  // 部分端只给画布相对坐标 x/y
  if (t && typeof t.x === 'number') {
    return { x: t.x, y: t.y };
  }
  return null;
};

const isInCanvas = (p: { x: number; y: number }) =>
  p.x >= 0 && p.y >= 0 && p.x <= canvasWidth.value && p.y <= canvasHeight.value;

// ================= 绘制核心（供 触摸 / 鼠标 共用） =================
const strokeStart = (p: { x: number; y: number }) => {
  if (!ctx || !isInCanvas(p)) return;
  drawing = true;
  lastX = p.x;
  lastY = p.y;
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.draw(true);
};

const strokeMove = (p: { x: number; y: number }) => {
  if (!ctx || !drawing) return;
  if (!isInCanvas(p)) return;
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(p.x, p.y);
  ctx.stroke();
  ctx.draw(true);
  lastX = p.x;
  lastY = p.y;
  hasInk.value = true;
};

const strokeEnd = () => {
  drawing = false;
};

// ================= 触摸绘制 =================
const onTouchStart = (e: any) => {
  if (isH5) {
    lastTouchAt = Date.now();
    (e as any).preventDefault?.();
    (e as any).stopPropagation?.();
  }
  const p = getPointFromEvent(e);
  if (p) strokeStart(p);
};

const onTouchMove = (e: any) => {
  if (!drawing) return;
  if (isH5) {
    (e as any).preventDefault?.();
    (e as any).stopPropagation?.();
  }
  const p = getPointFromEvent(e);
  if (p) strokeMove(p);
};

const onTouchEnd = () => {
  strokeEnd();
};

// ================= H5 鼠标绘制（桌面无触摸事件也能签） =================
let mouseDown = false;

const onMouseDown = (e: MouseEvent) => {
  if (!editorVisible.value || isReadonly.value) return;
  if (Date.now() - lastTouchAt < 700) return; // 忽略触摸后浏览器合成的 mouse
  if (e.button !== 0) return;
  const p = getLocalPoint(e.clientX, e.clientY);
  if (!p) return;
  if (!isInCanvas(p)) return;
  mouseDown = true;
  e.preventDefault();
  strokeStart(p);
};

const onMouseMove = (e: MouseEvent) => {
  if (!mouseDown || !editorVisible.value) return;
  const p = getLocalPoint(e.clientX, e.clientY);
  if (p) strokeMove(p);
};

const onMouseUp = () => {
  if (!mouseDown) return;
  mouseDown = false;
  strokeEnd();
};

onMounted(() => {
  // 视口变化监听：状态栏显隐 / 转屏都会改变视口，编辑层打开期间需要据此重算
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', onViewportResize);
    window.addEventListener('orientationchange', onViewportResize);
  }
  if (typeof uni.onWindowResize === 'function') {
    uni.onWindowResize(onViewportResize);
  }

  if (!isH5 || typeof document === 'undefined') return;
  document.addEventListener('mousedown', onMouseDown);
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
});

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', onViewportResize);
    window.removeEventListener('orientationchange', onViewportResize);
  }
  if (typeof uni.offWindowResize === 'function') {
    uni.offWindowResize(onViewportResize);
  }
  if (vpTimer) {
    clearTimeout(vpTimer);
    vpTimer = null;
  }

  if (!isH5 || typeof document === 'undefined') return;
  document.removeEventListener('mousedown', onMouseDown);
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
});

// ================= 操作 =================
const onAreaTap = () => {
  openEditor();
};

const onCancel = () => {
  closeEditor();
  emit('cancel');
};

const onClear = () => {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value);
  ctx.draw(true);
  hasInk.value = false;
};

const emitValue = (value: string) => {
  emit('update:modelValue', value);
  emit('change', value);
  formItemContext?.onValueChange(value);
};

const onConfirm = () => {
  if (!ctx) return;
  // 无笔迹：作为清除签名处理（若此前已签则置空）
  if (!hasInk.value) {
    if (props.modelValue) {
      emitValue('');
      emit('clear');
    }
    closeEditor();
    return;
  }
  const w = canvasWidth.value;
  const h = canvasHeight.value;
  const scale = props.exportScale > 0 ? props.exportScale : 1;

  // H5：uni.canvasToTempFilePath 在部分 uni-h5 环境导出的 PNG 为空（真实 DOM 有墨迹但导出透明），
  // 改为直接序列化真实绘制 canvas（内层 canvas 位图就是完整墨迹），再按 exportScale 放大。
  if (isH5) {
    h5Export(w, h, scale);
    return;
  }

  // 其余端（小程序 / App）：保持原 uni 导出（本地临时文件路径）
  ctx.draw(false, () => {
    uni.canvasToTempFilePath({
      canvasId,
      x: 0,
      y: 0,
      width: w,
      height: h,
      destWidth: Math.round(w * scale),
      destHeight: Math.round(h * scale),
      fileType: 'png',
      quality: 1,
      success: (res: any) => {
        const path = res.tempFilePath;
        emitValue(path);
        emit('confirm', path);
        closeEditor();
      },
      fail: (err: any) => {
        console.error('[tsm-esign] export failed', err);
      },
    });
  });
};

/** H5 直接导出：读取内层 canvas 位图 → 放大 → dataURL（PNG，保留透明背景） */
const h5Export = (w: number, h: number, scale: number) => {
  const doExport = () => {
    const inner = getH5InnerCanvas();
    if (!inner) {
      console.warn('[tsm-esign] h5 canvas not found, fallback to uni export');
      uniFallbackExport(w, h, scale);
      return;
    }
    try {
      const sw = inner.width || w;
      const sh = inner.height || h;
      const dw = Math.max(1, Math.round(sw * scale));
      const dh = Math.max(1, Math.round(sh * scale));
      const out = document.createElement('canvas');
      out.width = dw;
      out.height = dh;
      const g = out.getContext('2d');
      let url: string;
      if (g) {
        g.imageSmoothingEnabled = true;
        g.drawImage(inner, 0, 0, sw, sh, 0, 0, dw, dh);
        url = out.toDataURL('image/png');
      } else {
        url = inner.toDataURL('image/png');
      }
      emitValue(url);
      emit('confirm', url);
      closeEditor();
    } catch (e) {
      console.error('[tsm-esign] h5 export failed', e);
      uniFallbackExport(w, h, scale);
    }
  };
  // 等最后一笔已落到 DOM 后再读取
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(() => requestAnimationFrame(doExport));
  } else {
    doExport();
  }
};

const uniFallbackExport = (w: number, h: number, scale: number) => {
  ctx?.draw(false, () => {
    uni.canvasToTempFilePath({
      canvasId,
      x: 0,
      y: 0,
      width: w,
      height: h,
      destWidth: Math.round(w * scale),
      destHeight: Math.round(h * scale),
      fileType: 'png',
      quality: 1,
      success: (res: any) => {
        const path = res.tempFilePath;
        emitValue(path);
        emit('confirm', path);
        closeEditor();
      },
      fail: (err: any) => {
        console.error('[tsm-esign] export failed', err);
      },
    });
  });
};

// ================= 暴露给调用方 =================
defineExpose({
  /** 当前是否处于横屏签字态（响应式，可在 computed / watch 中直接使用） */
  isLandscape,
  /** 当前是否处于横屏签字态（函数取值，兜底场景用） */
  getIsLandscape: () => isLandscape.value,
});
</script>

<style scoped lang="scss">
.tsm-esign {
  width: 100%;

  &__area {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    overflow: hidden;
    box-sizing: border-box;

    &--readonly {
      // 语义 class：点击逻辑在脚本内拦截；只读空态的高度/底色由 areaStyle 决定
    }
  }

  &__image {
    width: 100%;
    height: 100%;
  }

  &__placeholder {
    padding: 0 var(--tsm-spacing-m, 8px);
    color: var(--tsm-color-primary, #444ce7);
    font-family: var(--tsm-font-family-regular, sans-serif);
    font-size: var(--tsm-font-size-text-l, 16px);
    font-weight: var(--tsm-font-weight-bold, 600);
    text-align: center;

    // 只读态占位符：中性文本色，不用主色加粗（否则看着像可点击的入口）
    &--readonly {
      width: 100%;
      padding: 0;
      // 展示区是居中 flex，占位符得先撑满一行，左对齐才对得上同列其它字段的值
      text-align: left;
      color: var(--tsm-color-text-primary, #181d27);
      font-weight: var(--tsm-font-weight-regular, 400);
    }
  }

  &__overlay {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 10001;
    overflow: hidden;
    box-sizing: border-box;
    background: var(--tsm-color-bg-white, #ffffff);
  }

  // ---------- 顶栏取消按钮（左右分支共用） ----------
  &__header-cancel {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  // 返回箭头：用两条相邻边框旋转 45° 组成向左的 chevron
  &__header-back {
    box-sizing: border-box;
    width: 11px;
    height: 11px;
    border-left: 2px solid var(--tsm-color-text-primary, #181d27);
    border-bottom: 2px solid var(--tsm-color-text-primary, #181d27);
    transform: rotate(45deg);
  }

  // ---------- 真横屏(旋转) 分支：上下结构（顶部栏正常渲染 + 下方旋转板） ----------
  &__rot {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
    box-sizing: border-box;
    background: #ffffff;

    // 顶部栏（不旋转，正常横排）：← 返回 + 标题居中
    &-top {
      display: flex;
      align-items: center;
      flex-shrink: 0;
      padding: 0 var(--tsm-spacing-m, 8px);
      box-sizing: border-box;
      background: #ffffff;
    }

    &-top-back {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      flex-shrink: 0;
      box-sizing: border-box;
    }

    &-top-right {
      width: 44px;
      height: 44px;
      flex-shrink: 0;
      box-sizing: border-box;
    }

    // 旋转板宿主：顶部栏以下区域，溢出裁剪
    &-board-host {
      position: relative;
      flex: 1;
      min-height: 0;
      overflow: hidden;
      box-sizing: border-box;
    }

    // 旋转板：absolute + rotate90（宽高/定位由 rotBoxStyle 注入）
    &-board {
      position: absolute;
      top: 0;
      overflow: hidden;
      box-sizing: border-box;
    }

    // 板内容：上签名区 / 下按钮行
    &-main {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-width: 0;
      box-sizing: border-box;
      background: #ffffff;
    }

    &-area {
      display: flex;
      flex: 1;
      min-height: 0;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
    }

    &-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
      box-sizing: border-box;
    }
  }

  // ---------- 常规 分支 ----------
  &__normal {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 96rpx;
    padding: 0 var(--tsm-spacing-xl, 12px);
    box-sizing: border-box;

    &-title {
      flex: 1;
      color: var(--tsm-color-text-primary, #181d27);
      font-size: var(--tsm-font-size-text-l, 16px);
      font-weight: var(--tsm-font-weight-medium, 500);
      text-align: center;
    }

    &-right {
      width: 120rpx;
    }
  }

  &__body {
    display: flex;
    flex: 1;
    min-height: 0;
    box-sizing: border-box;
    padding: 0 var(--tsm-spacing-xl, 12px);
  }

  &__canvas-area {
    position: relative;
    display: flex;
    flex: 1;
    min-height: 0;
    align-items: center;
    justify-content: center;
  }

  &__canvas-box {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: var(--tsm-radius-m, 8px);
  }

  &__canvas {
    display: block;
  }

  &__canvas-hint {
    position: absolute;
    left: 50%;
    top: 50%;
    z-index: 1;
    color: var(--tsm-color-text-placeholder, #a4a7ae);
    font-size: 48px;
    white-space: nowrap;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    padding: var(--tsm-spacing-s, 4px) var(--tsm-spacing-xl, 12px) var(--tsm-spacing-xl, 12px);
  }
}
</style>
