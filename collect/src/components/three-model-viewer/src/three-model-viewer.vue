<template>
  <div class="three-model-viewer" ref="hostRef">
    <!-- 加载进度 -->
    <div v-if="progress < 100 && !error" class="mv-loading">
      <div class="mv-bar">
        <div class="mv-bar-fill" :style="{ width: progress + '%' }"></div>
      </div>
      <span class="mv-loading-text">模型加载中 {{ progress }}%</span>
    </div>

    <!-- 错误兜底 -->
    <div v-if="error" class="mv-error">⚠️ 加载失败：{{ error }}</div>

    <!-- 选中网格信息卡 -->
    <div v-if="selected" class="mv-info">
      <div class="mv-info-title">已选中网格</div>
      <div class="mv-info-row"><span>名称</span><b>{{ selected.name }}</b></div>
      <div class="mv-info-row"><span>三角面</span><b>{{ selected.triangles.toLocaleString() }}</b></div>
      <div class="mv-info-row"><span>材质</span><b>{{ selected.material }}</b></div>
      <div class="mv-info-hint">点击空白处取消高亮</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  createModelViewer,
  type LoadedInfo,
  type MaterialMode,
  type MeshInfo,
  type ModelViewer,
  type TransformMode,
  type ViewPreset,
} from './useModelViewer'

defineOptions({ name: 'ThreeModelViewer' })

const props = withDefaults(
  defineProps<{
    /** 模型地址（.glb / .gltf） */
    src: string
    background?: string
    autoRotate?: boolean
    grid?: boolean
    axes?: boolean
    bloom?: boolean
    shadow?: boolean
    stats?: boolean
    transform?: boolean
    transformMode?: TransformMode
    materialMode?: MaterialMode
    envIntensity?: number
    /** 裁剪平面剖切 */
    clipping?: boolean
    /** 环境贴图作为背景 */
    envBackground?: boolean
    /** 显示模型包围盒 */
    boundingBox?: boolean
  }>(),
  {
    background: '#0b0e1a',
    autoRotate: true,
    grid: true,
    axes: false,
    bloom: false,
    shadow: true,
    stats: false,
    transform: false,
    transformMode: 'translate',
    materialMode: 'real',
    envIntensity: 1,
    clipping: false,
    envBackground: false,
    boundingBox: false,
  },
)

const emit = defineEmits<{
  (e: 'progress', pct: number): void
  (e: 'loaded', info: LoadedInfo): void
  (e: 'select', info: MeshInfo | null): void
  (e: 'error', msg: string): void
  (e: 'anim-play-state', playing: boolean): void
}>()

const hostRef = ref<HTMLDivElement | null>(null)
let viewer: ModelViewer | null = null

const progress = ref(0)
const error = ref('')
const selected = ref<MeshInfo | null>(null)

onMounted(() => {
  viewer = createModelViewer(
    () => hostRef.value,
    {
      onProgress: (p) => {
        if (p === 0) error.value = ''
        progress.value = p
        emit('progress', p)
      },
      onLoaded: (info) => emit('loaded', info),
      onSelect: (info) => {
        selected.value = info
        emit('select', info)
      },
      onError: (msg) => {
        error.value = msg
        emit('error', msg)
      },
      onAnimPlayState: (playing) => emit('anim-play-state', playing),
    },
    {
      background: props.background,
      autoRotate: props.autoRotate,
      grid: props.grid,
      axes: props.axes,
      bloom: props.bloom,
      shadow: props.shadow,
      stats: props.stats,
      transform: props.transform,
      transformMode: props.transformMode,
      materialMode: props.materialMode,
      envIntensity: props.envIntensity,
      clipping: props.clipping,
      envBackground: props.envBackground,
      boundingBox: props.boundingBox,
    },
  )
  viewer.load(props.src)
})

watch(() => props.src, (url) => viewer?.load(url))
watch(() => props.materialMode, (m) => viewer?.setMaterialMode(m))
watch(() => props.autoRotate, (v) => viewer?.setAutoRotate(v))
watch(() => props.grid, (v) => viewer?.setGrid(v))
watch(() => props.axes, (v) => viewer?.setAxes(v))
watch(() => props.bloom, (v) => viewer?.setBloom(v))
watch(() => props.shadow, (v) => viewer?.setShadow(v))
watch(() => props.stats, (v) => viewer?.setStats(v))
watch(() => props.transform, (v) => viewer?.setTransform(v))
watch(() => props.transformMode, (m) => viewer?.setTransformMode(m))
watch(() => props.envIntensity, (v) => viewer?.setEnvIntensity(v))
watch(() => props.clipping, (v) => viewer?.setClipping(v))
watch(() => props.envBackground, (v) => viewer?.setEnvBackground(v))
watch(() => props.boundingBox, (v) => viewer?.setBoundingBox(v))

onBeforeUnmount(() => viewer?.dispose())

defineExpose({
  playAnimation: (name: string | null) => viewer?.playAnimation(name),
  setAnimationPlaying: (on: boolean) => viewer?.setAnimationPlaying(on),
  setView: (preset: ViewPreset) => viewer?.setView(preset),
  setClipping: (on: boolean) => viewer?.setClipping(on),
  setClipPosition: (t: number) => viewer?.setClipPosition(t),
  setBoundingBox: (on: boolean) => viewer?.setBoundingBox(on),
  setEnvBackground: (on: boolean) => viewer?.setEnvBackground(on),
  setAnimSpeed: (v: number) => viewer?.setAnimSpeed(v),
  setExplode: (t: number) => viewer?.setExplode(t),
  setMetalness: (v: number) => viewer?.setMetalness(v),
  setRoughness: (v: number) => viewer?.setRoughness(v),
  loadUrl: (url: string) => viewer?.load(url),
  resetView: () => viewer?.resetView(),
  frameView: () => viewer?.frameView(),
  screenshot: () => viewer?.screenshot() ?? null,
})
</script>

<style scoped lang="less">
.three-model-viewer {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #0b0e1a;
}

.mv-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 280px;
  text-align: center;
  z-index: 15;
  user-select: none;

  .mv-bar {
    height: 6px;
    border-radius: 4px;
    background: rgba(120, 160, 255, 0.18);
    overflow: hidden;
  }
  .mv-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #5b8cff, #8a6bff);
    transition: width 0.2s ease;
  }
  .mv-loading-text {
    display: block;
    margin-top: 10px;
    color: #aab8e8;
    font-size: 13px;
  }
}

.mv-error {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 16px;
  background: rgba(80, 20, 30, 0.85);
  border: 1px solid rgba(255, 120, 120, 0.4);
  border-radius: 8px;
  color: #ffb4b4;
  font-size: 13px;
  z-index: 15;
}

.mv-info {
  position: absolute;
  left: 16px;
  bottom: 16px;
  min-width: 190px;
  padding: 12px 14px;
  background: rgba(12, 16, 32, 0.82);
  border: 1px solid rgba(120, 160, 255, 0.28);
  border-radius: 10px;
  color: #cdd8ff;
  font-size: 12px;
  backdrop-filter: blur(8px);
  z-index: 15;

  .mv-info-title {
    font-weight: 600;
    color: #8ab4ff;
    margin-bottom: 8px;
  }
  .mv-info-row {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    line-height: 1.9;
    span {
      color: #8595c4;
    }
    b {
      color: #fff;
      font-weight: 600;
    }
  }
  .mv-info-hint {
    margin-top: 6px;
    color: #6b7aa8;
    font-size: 11px;
  }
}
</style>
