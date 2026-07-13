<template>
  <el-popover
    placement="top"
    :width="240"
    trigger="hover"
    :visible="visible"
    @update:visible="visibleChange"
    @show="handleShow"
  >
    <template #reference>
      <div class="te-qrcode-icon">
        <el-icon :size="20"><Picture /></el-icon>
      </div>
    </template>
    <div class="te-qrcode-carousel" :class="{ 'is-no-animate': isNoAnimate, 'is-one-image': data.length === 1 }">
      <div v-if="data.length > 0" class="te-qrcode-list">
        <div
          v-for="(item, idx) in data"
          :key="item.code"
          class="te-qrcode-item"
          :class="{ active: idx === activeIndex }"
          @click="activeIndex = idx"
        >
          <div class="te-qrcode-item-title">{{ item.schemeName }}</div>
          <canvas :ref="(el) => bindCanvasRef(el as HTMLCanvasElement | null, idx)"></canvas>
        </div>
      </div>
      <div v-else class="te-qrcode-empty" v-loading="loading">
        <span v-if="!loading">暂无图形码，请启用编码方案</span>
      </div>
    </div>
  </el-popover>
</template>

<script lang="ts" setup>
import { ref, nextTick, watch } from 'vue';
import { ElPopover, vLoading, ElIcon } from 'element-plus';
import { Picture } from '@element-plus/icons-vue';
import QRCode from 'qrcode';

export interface QrcodeScheme {
  code: string;
  schemeName: string;
  scanType: 'QRCODE' | 'BARCODE';
  scanContent: string;
}

const props = withDefaults(
  defineProps<{
    /** 模拟数据,不传则用内置示例 */
    data?: QrcodeScheme[];
  }>(),
  {
    data: () => [
      { code: '1', schemeName: '主二维码', scanType: 'QRCODE', scanContent: 'https://example.com/asset/A-001' },
      { code: '2', schemeName: '备用条形码', scanType: 'BARCODE', scanContent: 'TS-2026-A-001' },
      { code: '3', schemeName: '巡检二维码', scanType: 'QRCODE', scanContent: 'INSP-2026-A-001' },
    ],
  },
);

const visible = ref(false);
const data = ref<QrcodeScheme[]>([]);
const isNoAnimate = ref(false);
const loading = ref(true);
const activeIndex = ref(0);
const canvasRefs = ref<(HTMLCanvasElement | null)[]>([]);

const bindCanvasRef = (el: HTMLCanvasElement | null, idx: number) => {
  canvasRefs.value[idx] = el;
};

const visibleChange = (val: boolean) => {
  visible.value = val;
  setTimeout(() => {
    isNoAnimate.value = !val;
  }, 100);
};

const handleShow = () => {
  loading.value = true;
  // 模拟接口延迟
  setTimeout(() => {
    data.value = props.data;
    loading.value = false;
    nextTick(() => drawAll());
  }, 300);
};

const drawAll = () => {
  data.value.forEach((item, index) => {
    const c = canvasRefs.value[index];
    if (!c) return;
    if (item.scanType === 'QRCODE') {
      QRCode.toCanvas(c, item.scanContent, { width: 164 }).catch((e: any) => console.error(e));
    } else {
      drawFakeBarcode(c, item.scanContent);
    }
  });
};

watch(activeIndex, () => nextTick(() => drawAll()));

/** 用 canvas 模拟画一个"条形码"风格 */
const drawFakeBarcode = (canvas: HTMLCanvasElement, content: string) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = 200;
  const H = 80;
  canvas.width = W;
  canvas.height = H;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#000';

  // 根据 content 字符生成确定性的条形码样式
  let seed = 0;
  for (let i = 0; i < content.length; i++) seed = (seed * 31 + content.charCodeAt(i)) & 0xffff;
  const rand = (n: number) => {
    seed = (seed * 9301 + 49297) & 0xffff;
    return (seed % n) + 1;
  };

  let x = 10;
  while (x < W - 10) {
    const w = rand(4);
    if (Math.random() > 0.4) {
      ctx.fillRect(x, 5, w, H - 25);
    }
    x += w + rand(2);
  }

  ctx.font = '12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(content, W / 2, H - 6);
};

defineOptions({ name: 'TeQrcodeView' });
</script>

<style lang="less" scoped>
.te-qrcode-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.15s;

  &:hover {
    opacity: 1;
  }
}

.te-qrcode-carousel {
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.te-qrcode-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.te-qrcode-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;

  &.active {
    border-color: #409eff;
    background: #ecf5ff;
  }

  &-title {
    font-size: 14px;
    margin-bottom: 6px;
    text-align: center;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  canvas {
    max-width: 100%;
  }
}

.te-qrcode-empty {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 12px;
}

.is-one-image .te-qrcode-item {
  cursor: default;
}
</style>
