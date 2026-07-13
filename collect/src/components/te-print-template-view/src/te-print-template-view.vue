<template>
  <div class="te-print-template-view" :class="{ 'is-print': isPrint }">
    <div class="tptv-toolbar">
      <el-button-group>
        <el-button :type="!isPrint ? 'primary' : 'default'" @click="isPrint = false">预览</el-button>
        <el-button :type="isPrint ? 'primary' : 'default'" @click="isPrint = true">打印</el-button>
      </el-button-group>
      <span class="tptv-tip">画布 {{ template.width }}mm × {{ template.height }}mm | 缩放 {{ (scale * 100).toFixed(0) }}%</span>
    </div>

    <div ref="stageRef" class="tptv-stage">
      <div
        class="tptv-page"
        :style="{
          width: `${template.width}mm`,
          height: `${template.height}mm`,
          transform: `scale(${scale})`,
        }"
      >
        <component
          :is="itemMap[item.type]"
          v-for="item in template.items"
          :key="item.id"
          :item="item"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { ElButton, ElButtonGroup } from 'element-plus';
import { throttle } from '../../_mock/utils';
import StyledText from './components/styled-text.vue';
import TextItem from './components/text-item.vue';
import ImageItem from './components/image-item.vue';
import QrcodeItem from './components/qrcode-item.vue';
import BarcodeItem from './components/barcode-item.vue';
import TableItem from './components/table-item.vue';

export interface PtItemBase {
  id: string;
  /** 元素类型 */
  type: 'text' | 'image' | 'qrcode' | 'barcode' | 'table' | 'styled-text';
  /** mm 单位 */
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PtTemplate {
  width: number;
  height: number;
  items: PtItemBase[];
}

const props = withDefaults(
  defineProps<{
    template: PtTemplate;
    isPrint?: boolean;
  }>(),
  { isPrint: false }
);

const emit = defineEmits<{ (e: 'update:isPrint', v: boolean): void }>();

const stageRef = ref<HTMLElement | null>(null);
const stageSize = ref({ width: 800, height: 600 });
const isPrintLocal = ref(props.isPrint);

watch(
  () => props.isPrint,
  (v) => (isPrintLocal.value = v)
);
watch(isPrintLocal, (v) => emit('update:isPrint', v));

const isPrint = computed({
  get: () => isPrintLocal.value,
  set: (v) => (isPrintLocal.value = v),
});

/** 计算 mm → px 的换算比, 用 1mm 的 div 测 */
const getPxPerMm = (() => {
  let cached = 0;
  return (): number => {
    if (cached) return cached;
    if (typeof document === 'undefined') return 3.78;
    const div = document.createElement('div');
    div.style.width = '1mm';
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    document.body.appendChild(div);
    cached = div.getBoundingClientRect().width || 3.78;
    document.body.removeChild(div);
    return cached;
  };
})();

const pxPerMm = ref(3.78);

const measure = () => {
  pxPerMm.value = getPxPerMm();
  if (stageRef.value) {
    const rect = stageRef.value.getBoundingClientRect();
    stageSize.value = { width: rect.width, height: rect.height };
  }
};

const scale = computed(() => {
  // 留 32px 边距
  const padding = 32;
  const maxW = (stageSize.value.width - padding) / pxPerMm.value;
  const maxH = (stageSize.value.height - padding) / pxPerMm.value;
  return Math.min(maxW / props.template.width, maxH / props.template.height, 1.5);
});

const onResize = throttle(measure, 200);

onMounted(() => {
  measure();
  window.addEventListener('resize', onResize);
});
onBeforeUnmount(() => window.removeEventListener('resize', onResize));

/* 注册局部组件 */
const itemMap: Record<string, any> = {
  text: TextItem,
  'styled-text': StyledText,
  image: ImageItem,
  qrcode: QrcodeItem,
  barcode: BarcodeItem,
  table: TableItem,
};

defineOptions({ name: 'TePrintTemplateView' });
</script>

<style lang="less" scoped>
.te-print-template-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f7fa;

  .tptv-toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 16px;
    background: #fff;
    border-bottom: 1px solid #ebeef5;

    .tptv-tip { color: #909399; font-size: 12px; }
  }

  .tptv-stage {
    flex: 1;
    overflow: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }

  .tptv-page {
    background: #fff;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    position: relative;
    transform-origin: center center;
    flex-shrink: 0;
  }

  &.is-print {
    background: #fff;
    .tptv-stage {
      padding: 0;
      overflow: visible;
    }
    .tptv-page {
      box-shadow: none;
      page-break-after: always;
    }
  }
}
</style>
