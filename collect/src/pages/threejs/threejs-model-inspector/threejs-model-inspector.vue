<template>
  <div class="mi-page">
    <!-- ==================== 顶部工具栏 ==================== -->
    <div class="mi-toolbar">
      <div class="mi-group">
        <label>模型</label>
        <select v-model="currentKey" class="mi-select">
          <option v-for="m in MODELS" :key="m.key" :value="m.key">{{ m.label }}</option>
        </select>
        <button class="mi-file" @click="fileInput?.click()">加载本地 .glb</button>
        <input ref="fileInput" type="file" accept=".glb,.gltf" style="display: none" @change="onFileChange" />
      </div>

      <div class="mi-group">
        <label>材质</label>
        <div class="mi-seg">
          <button
            v-for="m in MATERIAL_MODES"
            :key="m.value"
            :class="{ active: materialMode === m.value }"
            @click="materialMode = m.value"
          >
            {{ m.label }}
          </button>
        </div>
      </div>

      <div class="mi-group">
        <label>相机</label>
        <div class="mi-seg">
          <button v-for="v in VIEW_PRESETS" :key="v.value" @click="viewerRef?.setView(v.value)">
            {{ v.label }}
          </button>
        </div>
      </div>

      <div class="mi-group mi-toggles">
        <label>开关</label>
        <button :class="{ on: autoRotate }" @click="autoRotate = !autoRotate">自动旋转</button>
        <button :class="{ on: grid }" @click="grid = !grid">网格</button>
        <button :class="{ on: axes }" @click="axes = !axes">坐标轴</button>
        <button :class="{ on: shadow }" @click="shadow = !shadow">阴影</button>
        <button :class="{ on: bloom }" @click="bloom = !bloom">泛光</button>
        <button :class="{ on: stats }" @click="stats = !stats">FPS</button>
        <button :class="{ on: transform }" @click="transform = !transform">变换</button>
        <button :class="{ on: clipping }" @click="clipping = !clipping">剖切</button>
        <button :class="{ on: boundingBox }" @click="boundingBox = !boundingBox">包围盒</button>
        <button :class="{ on: envBackground }" @click="envBackground = !envBackground">环境背景</button>
      </div>

      <div class="mi-group" v-if="transform">
        <label>变换模式</label>
        <div class="mi-seg">
          <button
            v-for="t in TRANSFORM_MODES"
            :key="t.value"
            :class="{ active: transformMode === t.value }"
            @click="transformMode = t.value"
          >
            {{ t.label }}
          </button>
        </div>
      </div>

      <div class="mi-group mi-env">
        <label>环境 {{ envIntensity.toFixed(1) }}</label>
        <input type="range" min="0" max="3" step="0.1" v-model.number="envIntensity" />
      </div>

      <div class="mi-group" v-if="animations.length">
        <label>动画</label>
        <select v-model="currentAnim" class="mi-select">
          <option v-for="a in animations" :key="a" :value="a">{{ a }}</option>
        </select>
        <button :class="{ on: animPlaying }" @click="toggleAnim">{{ animPlaying ? '暂停' : '播放' }}</button>
      </div>

      <div class="mi-group mi-sliders">
        <label>剖切</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          :disabled="!clipping"
          v-model.number="clipPos"
          @input="onClipPos"
        />
      </div>

      <div class="mi-group mi-sliders">
        <label>爆炸 {{ explode.toFixed(2) }}</label>
        <input type="range" min="0" max="1" step="0.01" v-model.number="explode" @input="onExplode" />
      </div>

      <div class="mi-group mi-sliders">
        <label>动画速度 {{ animSpeed.toFixed(2) }}</label>
        <input type="range" min="0" max="2" step="0.05" v-model.number="animSpeed" @input="onAnimSpeed" />
      </div>

      <div class="mi-group mi-sliders">
        <label>金属度 {{ metalness.toFixed(2) }}</label>
        <input type="range" min="0" max="1" step="0.02" v-model.number="metalness" @input="onMetalness" />
      </div>

      <div class="mi-group mi-sliders">
        <label>粗糙度 {{ roughness.toFixed(2) }}</label>
        <input type="range" min="0" max="1" step="0.02" v-model.number="roughness" @input="onRoughness" />
      </div>

      <div class="mi-group mi-actions">
        <button @click="resetView">重置视角</button>
        <button @click="frameView">适配视图</button>
        <button @click="capture">截图保存</button>
      </div>
    </div>

    <!-- ==================== 3D 视口 ==================== -->
    <div
      class="mi-stage"
      :class="{ 'mi-dragover': dragOver }"
      @dragover.prevent="dragOver = true"
      @dragleave.prevent="dragOver = false"
      @drop.prevent="onDrop"
    >
      <ThreeModelViewer
        ref="viewerRef"
        :src="src"
        :background="background"
        :auto-rotate="autoRotate"
        :grid="grid"
        :axes="axes"
        :bloom="bloom"
        :shadow="shadow"
        :stats="stats"
        :transform="transform"
        :transform-mode="transformMode"
        :material-mode="materialMode"
        :env-intensity="envIntensity"
        :clipping="clipping"
        :bounding-box="boundingBox"
        :env-background="envBackground"
        @loaded="onLoaded"
        @select="onSelect"
        @error="onError"
        @anim-play-state="onAnimPlayState"
      />

      <!-- 模型信息卡 -->
      <div v-if="loaded" class="mi-meta">
        <div class="mi-meta-title">{{ loaded.name }}</div>
        <div class="mi-meta-row">
          <span>网格</span>
          <b>{{ loaded.meshes }}</b>
        </div>
        <div class="mi-meta-row">
          <span>三角面</span>
          <b>{{ loaded.triangles.toLocaleString() }}</b>
        </div>
        <div class="mi-meta-row">
          <span>尺寸</span>
          <b>{{ loaded.size.x }}×{{ loaded.size.y }}×{{ loaded.size.z }}</b>
        </div>
        <div class="mi-meta-row">
          <span>动画</span>
          <b>{{ loaded.animations.length }}</b>
        </div>
      </div>

      <!-- 拖拽提示 -->
      <div v-if="dragOver" class="mi-drop">松开以加载本地 .glb / .gltf 模型</div>

      <!-- 交互提示 -->
      <div class="mi-hint">🖱️ 旋转·缩放·平移 · 点击高亮 · 悬浮预览 · 快捷键 R 重置 / F 适配 / 空格 播放</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import ThreeModelViewer from '@/components/three-model-viewer';
import type {
  LoadedInfo,
  MaterialMode,
  TransformMode,
  ViewPreset,
} from '@/components/three-model-viewer/src/useModelViewer';

defineOptions({ name: 'ThreejsModelInspectorDemo' });

const base = import.meta.env.BASE_URL || '/';

interface ModelDef {
  key: string;
  label: string;
  file: string;
}

const MODELS: ModelDef[] = [
  { key: 'helmet', label: '破损头盔 (PBR)', file: 'DamagedHelmet.glb' },
  { key: 'car', label: '玩具车 (车漆)', file: 'ToyCar.glb' },
  { key: 'fox', label: '狐狸 (骨骼动画)', file: 'Fox.glb' },
];
const MATERIAL_MODES: { value: MaterialMode; label: string }[] = [
  { value: 'real', label: '真实' },
  { value: 'wireframe', label: '线框' },
  { value: 'xray', label: 'X 光' },
];
const VIEW_PRESETS: { value: ViewPreset; label: string }[] = [
  { value: 'iso', label: '等轴' },
  { value: 'front', label: '前' },
  { value: 'side', label: '侧' },
  { value: 'top', label: '顶' },
];
const TRANSFORM_MODES: { value: TransformMode; label: string }[] = [
  { value: 'translate', label: '平移' },
  { value: 'rotate', label: '旋转' },
  { value: 'scale', label: '缩放' },
];

const currentKey = ref('helmet');
const current = computed<ModelDef>(() => MODELS.find((m) => m.key === currentKey.value) || MODELS[0]);
const src = computed(() => `${base}models/${current.value.file}`);
const background = '#0b0e1a';

const materialMode = ref<MaterialMode>('real');
const autoRotate = ref(true);
const grid = ref(true);
const axes = ref(false);
const shadow = ref(true);
const bloom = ref(false);
const stats = ref(false);
const transform = ref(false);
const transformMode = ref<TransformMode>('translate');
const envIntensity = ref(1);
const clipping = ref(false);
const boundingBox = ref(false);
const envBackground = ref(false);

const clipPos = ref(0);
const explode = ref(0);
const animSpeed = ref(1);
const metalness = ref(1);
const roughness = ref(1);

const loaded = ref<LoadedInfo | null>(null);
const animations = ref<string[]>([]);
const currentAnim = ref<string | null>(null);
const animPlaying = ref(true);

const viewerRef = ref<InstanceType<typeof ThreeModelViewer> | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const dragOver = ref(false);
let lastObjectUrl: string | null = null;

const onLoaded = (info: LoadedInfo) => {
  loaded.value = info;
  animations.value = info.animations;
  if (info.animations.length) {
    currentAnim.value = info.animations[0];
    animPlaying.value = true;
  } else {
    currentAnim.value = null;
    animPlaying.value = false;
  }
  // PBR 滑块初始化为该模型均值
  metalness.value = info.pbr.metalness;
  roughness.value = info.pbr.roughness;
};
const onSelect = () => {
  /* 选中信息已在组件内浮层展示，这里无需额外处理 */
};
const onError = () => {
  /* 错误已在组件内浮层展示 */
};
const onAnimPlayState = (playing: boolean) => {
  animPlaying.value = playing;
};

const toggleAnim = () => {
  animPlaying.value = !animPlaying.value;
  viewerRef.value?.setAnimationPlaying(animPlaying.value);
};

const resetView = () => {
  viewerRef.value?.resetView();
};
const frameView = () => {
  viewerRef.value?.frameView();
};
const capture = () => {
  const url = viewerRef.value?.screenshot();
  if (!url) return;
  const a = document.createElement('a');
  a.href = url;
  a.download = `${current.value.key}-${Date.now()}.png`;
  a.click();
};

const onClipPos = () => {
  viewerRef.value?.setClipPosition(clipPos.value);
};
const onExplode = () => {
  viewerRef.value?.setExplode(explode.value);
};
const onAnimSpeed = () => {
  viewerRef.value?.setAnimSpeed(animSpeed.value);
};
const onMetalness = () => {
  viewerRef.value?.setMetalness(metalness.value);
};
const onRoughness = () => {
  viewerRef.value?.setRoughness(roughness.value);
};

// 切换内置模型时重置高级控件
watch(currentKey, () => {
  clipPos.value = 0;
  explode.value = 0;
  animSpeed.value = 1;
  clipping.value = false;
  boundingBox.value = false;
  envBackground.value = false;
  viewerRef.value?.setExplode(0);
  viewerRef.value?.setAnimSpeed(1);
});

// ── 本地模型加载 ─────────────────────────────────────────
const loadLocalFile = (file: File) => {
  if (!/\.(glb|gltf)$/i.test(file.name)) {
    window.alert('仅支持 .glb / .gltf 文件');
    return;
  }
  if (lastObjectUrl) URL.revokeObjectURL(lastObjectUrl);
  lastObjectUrl = URL.createObjectURL(file);
  // 切换回内置模型不会保留自定义文件，这里直接以 URL 加载
  viewerRef.value?.loadUrl(lastObjectUrl);
  loaded.value = {
    ...(loaded.value || {
      name: file.name,
      triangles: 0,
      meshes: 0,
      animations: [],
      size: { x: 0, y: 0, z: 0 },
      pbr: { metalness: 1, roughness: 1 },
    }),
    name: file.name,
  };
};

const onFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) loadLocalFile(file);
  input.value = '';
};
const onDrop = (e: DragEvent) => {
  dragOver.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file) loadLocalFile(file);
};
</script>

<style scoped lang="less">
.mi-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #0b0e1a;
  color: #dce5ff;
}

.mi-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  background: rgba(14, 18, 36, 0.9);
  border-bottom: 1px solid rgba(120, 160, 255, 0.18);
  z-index: 20;
}

.mi-group {
  display: flex;
  align-items: center;
  gap: 8px;

  > label {
    font-size: 12px;
    color: #8595c4;
    white-space: nowrap;
  }
}

.mi-file {
  background: #1b2342;
  color: #aab8e8;
  border: 1px solid rgba(120, 160, 255, 0.22);
  border-radius: 6px;
  padding: 5px 10px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: #5b8cff;
    color: #fff;
  }
}

.mi-select {
  background: #131a30;
  color: #dce5ff;
  border: 1px solid rgba(120, 160, 255, 0.25);
  border-radius: 6px;
  padding: 5px 8px;
  font-size: 12px;
  outline: none;
}

.mi-seg,
.mi-toggles,
.mi-actions {
  display: flex;
  gap: 6px;

  button {
    background: #131a30;
    color: #aab8e8;
    border: 1px solid rgba(120, 160, 255, 0.22);
    border-radius: 6px;
    padding: 5px 10px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
      border-color: #5b8cff;
      color: #fff;
    }
    &.active,
    &.on {
      background: linear-gradient(135deg, #5b8cff, #8a6bff);
      color: #fff;
      border-color: transparent;
    }
  }
}

.mi-sliders {
  input[type='range'] {
    width: 110px;
    accent-color: #5b8cff;
  }
}

.mi-stage {
  position: relative;
  flex: 1;
  min-height: 0;

  &.mi-dragover {
    outline: 2px dashed #5b8cff;
    outline-offset: -8px;
  }
}

.mi-meta {
  position: absolute;
  top: 14px;
  right: 14px;
  min-width: 180px;
  padding: 12px 14px;
  background: rgba(12, 16, 32, 0.82);
  border: 1px solid rgba(120, 160, 255, 0.28);
  border-radius: 10px;
  font-size: 12px;
  backdrop-filter: blur(8px);
  z-index: 15;

  .mi-meta-title {
    font-weight: 600;
    color: #8ab4ff;
    margin-bottom: 8px;
  }
  .mi-meta-row {
    display: flex;
    justify-content: space-between;
    gap: 18px;
    line-height: 1.9;
    span {
      color: #8595c4;
    }
    b {
      color: #fff;
      font-weight: 600;
    }
  }
}

.mi-drop {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(20, 30, 60, 0.6);
  color: #cfe0ff;
  font-size: 16px;
  z-index: 14;
  pointer-events: none;
}

.mi-hint {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  padding: 7px 14px;
  background: rgba(12, 16, 32, 0.8);
  border: 1px solid rgba(120, 160, 255, 0.22);
  border-radius: 8px;
  color: #8ab4f8;
  font-size: 12px;
  z-index: 15;
  pointer-events: none;
  white-space: nowrap;
}
</style>
