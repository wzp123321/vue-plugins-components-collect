<template>
  <div class="image-crop-page">
    <h5>图片裁剪上传</h5>
    <el-alert type="info" :closable="false" style="margin-bottom: 20px">
      使用原生 Canvas 实现图片裁剪功能，展示核心原理。
      生产环境推荐使用 <code>vue-cropper</code>（pnpm add vue-cropper）或 <code>cropperjs</code>。
    </el-alert>

    <el-row :gutter="20">
      <!-- 左侧：选图 + 裁剪区域 -->
      <el-col :span="14">
        <el-card>
          <template #header>① 选择图片并拖拽裁剪</template>

          <div v-if="!imageUrl" class="upload-zone" @click="triggerUpload" @dragover.prevent @drop.prevent="onDrop">
            <el-icon style="font-size:48px;color:#c0c4cc"><Plus /></el-icon>
            <p>点击或拖拽图片到此区域</p>
            <p style="font-size:12px;color:#999">支持 JPG / PNG / WebP</p>
          </div>

          <div v-else class="crop-area-wrapper">
            <div
              class="crop-container"
              ref="cropContainerRef"
              @mousedown="startDrag"
              @mousemove="onDrag"
              @mouseup="endDrag"
              @mouseleave="endDrag"
            >
              <img :src="imageUrl" class="source-img" ref="sourceImgRef" @load="onImageLoad" />
              <!-- 裁剪框 -->
              <div
                class="crop-box"
                :style="{
                  left: cropBox.x + 'px',
                  top: cropBox.y + 'px',
                  width: cropBox.w + 'px',
                  height: cropBox.h + 'px',
                }"
              >
                <div class="crop-guide"></div>
                <!-- 拖拽手柄 -->
                <div class="handle tl" @mousedown.stop="startResize('tl', $event)"></div>
                <div class="handle tr" @mousedown.stop="startResize('tr', $event)"></div>
                <div class="handle bl" @mousedown.stop="startResize('bl', $event)"></div>
                <div class="handle br" @mousedown.stop="startResize('br', $event)"></div>
              </div>
            </div>

            <div class="crop-actions">
              <el-button type="primary" @click="doCrop">✂️ 裁剪</el-button>
              <el-button @click="resetImage">重新选图</el-button>
              <span style="font-size:12px;color:#999">裁剪框：{{ Math.round(cropBox.w) }} × {{ Math.round(cropBox.h) }}</span>
            </div>
          </div>
          <input ref="fileInputRef" type="file" accept="image/*" style="display:none" @change="onFileChange" />
        </el-card>
      </el-col>

      <!-- 右侧：裁剪结果 + 代码 -->
      <el-col :span="10">
        <el-card>
          <template #header>② 裁剪结果预览</template>
          <div v-if="croppedUrl" class="cropped-preview">
            <img :src="croppedUrl" />
            <div style="margin-top:12px">
              <el-button type="success" size="small" @click="downloadCropped">⬇ 下载</el-button>
              <span style="font-size:12px;color:#999;margin-left:8px">{{ croppedSize }}</span>
            </div>
          </div>
          <div v-else class="empty-preview">裁剪后的图片将在这里显示</div>
        </el-card>

        <el-card style="margin-top:16px">
          <template #header>💻 vue-cropper 使用方式</template>
          <pre class="code-block">{{ vueCropperCode }}</pre>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { Plus } from '@element-plus/icons-vue';

defineOptions({ name: 'ImageCrop' });

const fileInputRef = ref<HTMLInputElement>();
const cropContainerRef = ref<HTMLDivElement>();
const sourceImgRef = ref<HTMLImageElement>();
const imageUrl = ref('');
const croppedUrl = ref('');
const croppedSize = ref('');

const cropBox = reactive({ x: 40, y: 40, w: 200, h: 150 });

let isDragging = false;
let isResizing = false;
let resizeHandle = '';
let dragStart = { x: 0, y: 0, cx: 0, cy: 0, cw: 0, ch: 0 };

const triggerUpload = () => fileInputRef.value?.click();

const onFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) loadFile(file);
};

const onDrop = (e: DragEvent) => {
  const file = e.dataTransfer?.files[0];
  if (file?.type.startsWith('image/')) loadFile(file);
};

const loadFile = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => { imageUrl.value = e.target?.result as string; };
  reader.readAsDataURL(file);
};

const onImageLoad = () => {
  const img = sourceImgRef.value!;
  cropBox.x = img.width * 0.1;
  cropBox.y = img.height * 0.1;
  cropBox.w = img.width * 0.8;
  cropBox.h = img.height * 0.8;
};

const startDrag = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (target.classList.contains('crop-box') || target.classList.contains('crop-guide')) {
    isDragging = true;
    dragStart = { x: e.clientX, y: e.clientY, cx: cropBox.x, cy: cropBox.y, cw: cropBox.w, ch: cropBox.h };
  }
};

const startResize = (handle: string, e: MouseEvent) => {
  isResizing = true;
  resizeHandle = handle;
  dragStart = { x: e.clientX, y: e.clientY, cx: cropBox.x, cy: cropBox.y, cw: cropBox.w, ch: cropBox.h };
};

const onDrag = (e: MouseEvent) => {
  if (!isDragging && !isResizing) return;
  const dx = e.clientX - dragStart.x;
  const dy = e.clientY - dragStart.y;
  const img = sourceImgRef.value!;
  if (isDragging) {
    cropBox.x = Math.max(0, Math.min(img.width - cropBox.w, dragStart.cx + dx));
    cropBox.y = Math.max(0, Math.min(img.height - cropBox.h, dragStart.cy + dy));
  } else if (isResizing) {
    if (resizeHandle.includes('r')) cropBox.w = Math.max(50, dragStart.cw + dx);
    if (resizeHandle.includes('b')) cropBox.h = Math.max(50, dragStart.ch + dy);
    if (resizeHandle.includes('l')) {
      cropBox.x = dragStart.cx + dx;
      cropBox.w = Math.max(50, dragStart.cw - dx);
    }
    if (resizeHandle.includes('t')) {
      cropBox.y = dragStart.cy + dy;
      cropBox.h = Math.max(50, dragStart.ch - dy);
    }
  }
};

const endDrag = () => { isDragging = false; isResizing = false; };

const doCrop = () => {
  const img = sourceImgRef.value!;
  const naturalW = img.naturalWidth;
  const naturalH = img.naturalHeight;
  const displayW = img.width;
  const displayH = img.height;
  const scaleX = naturalW / displayW;
  const scaleY = naturalH / displayH;

  const canvas = document.createElement('canvas');
  canvas.width = cropBox.w * scaleX;
  canvas.height = cropBox.h * scaleY;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, cropBox.x * scaleX, cropBox.y * scaleY, cropBox.w * scaleX, cropBox.h * scaleY, 0, 0, canvas.width, canvas.height);
  croppedUrl.value = canvas.toDataURL('image/jpeg', 0.9);
  croppedSize.value = `${Math.round(canvas.width)} × ${Math.round(canvas.height)} px`;
};

const downloadCropped = () => {
  const a = document.createElement('a');
  a.href = croppedUrl.value;
  a.download = 'cropped.jpg';
  a.click();
};

const resetImage = () => { imageUrl.value = ''; croppedUrl.value = ''; };

const vueCropperCode = `// pnpm add vue-cropper
import VueCropper from 'vue-cropper'
import 'vue-cropper/dist/index.css'

<VueCropper
  ref="cropperRef"
  :img="imageUrl"
  :autoCrop="true"
  :fixedBox="false"
  outputType="jpeg"
/>

// 获取裁剪结果
cropperRef.value.getCropBlob((blob) => {
  // blob 即裁剪后的文件
  const file = new File([blob], 'crop.jpg')
  uploadToServer(file)
})`;
</script>

<style lang="less" scoped>
.image-crop-page {
  padding: 20px;
  overflow-y: auto;
}

.upload-zone {
  height: 220px;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  gap: 12px;
  transition: all 0.2s;
  color: #606266;

  &:hover { border-color: #409eff; color: #409eff; }
}

.crop-container {
  position: relative;
  display: inline-block;
  cursor: crosshair;
  user-select: none;

  .source-img { display: block; max-width: 100%; max-height: 320px; }
}

.crop-box {
  position: absolute;
  border: 2px solid #409eff;
  cursor: move;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);

  .crop-guide {
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(
      0deg, transparent, transparent 33.33%, rgba(255,255,255,0.1) 33.33%, rgba(255,255,255,0.1) 34%
    ), repeating-linear-gradient(
      90deg, transparent, transparent 33.33%, rgba(255,255,255,0.1) 33.33%, rgba(255,255,255,0.1) 34%
    );
  }
}

.handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #409eff;
  border-radius: 2px;
  &.tl { top: -5px; left: -5px; cursor: nwse-resize; }
  &.tr { top: -5px; right: -5px; cursor: nesw-resize; }
  &.bl { bottom: -5px; left: -5px; cursor: nesw-resize; }
  &.br { bottom: -5px; right: -5px; cursor: nwse-resize; }
}

.crop-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
}

.cropped-preview {
  text-align: center;
  img { max-width: 100%; border-radius: 8px; border: 1px solid #e4e7ed; }
}

.empty-preview {
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 8px;
  color: #999;
  font-size: 14px;
}

.code-block {
  background: #1e1e2e;
  color: #cdd6f4;
  border-radius: 8px;
  padding: 14px;
  font-size: 11.5px;
  line-height: 1.7;
  overflow-x: auto;
  white-space: pre;
}
</style>
