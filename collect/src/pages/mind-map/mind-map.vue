<template>
  <div class="mind-page">
    <header class="mind-page__head">
      <h3 class="mind-page__title">思维导图（G6 mindmap 布局）</h3>
      <p class="mind-page__desc">
        复用站内已有的 G6，TreeGraph + mindmap 布局即可实现；双击节点添加子项，拖动画布缩放。
      </p>
      <div class="mind-page__actions">
        <button class="mind-btn" @click="fit">适配画布</button>
        <button class="mind-btn" @click="exportJson">导出结构 JSON</button>
      </div>
    </header>

    <div ref="canvasEl" class="mind-canvas"></div>

    <p v-if="jsonView" class="mind-page__json">{{ jsonView }}</p>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import G6, { type TreeGraphData } from '@antv/g6';

defineOptions({ name: 'MindMapDemo' });

const canvasEl = ref<HTMLElement | null>(null);
const jsonView = ref('');
let graph: InstanceType<typeof G6.TreeGraph> | null = null;
let seq = 100;

const TREE: TreeGraphData = {
  id: 'root',
  label: '前端能力收集站',
  children: [
    {
      id: 'components',
      label: '组件库',
      children: [
        { id: 'c1', label: '通用组件' },
        { id: 'c2', label: '业务组件' },
        { id: 'c3', label: '能力画像' },
      ],
    },
    {
      id: 'visual',
      label: '可视化 & 3D',
      children: [
        { id: 'v1', label: 'ECharts' },
        { id: 'v2', label: 'G6 拓扑' },
        { id: 'v3', label: 'Three.js' },
      ],
    },
    {
      id: 'engineering',
      label: '工程能力',
      children: [
        { id: 'e1', label: '请求层' },
        { id: 'e2', label: '表单文件' },
        { id: 'e3', label: '工具函数' },
      ],
    },
  ],
};

onMounted(() => {
  if (!canvasEl.value) return;
  const { clientWidth, clientHeight } = canvasEl.value;

  graph = new G6.TreeGraph({
    container: canvasEl.value,
    width: clientWidth,
    height: Math.max(clientHeight, 420),
    modes: { default: ['drag-canvas', 'zoom-canvas', 'drag-node'] },
    layout: {
      type: 'mindmap',
      direction: 'H',
      getWidth: () => 110,
      getHeight: () => 22,
      getHGap: () => 46,
      getVGap: () => 16,
    },
    defaultNode: {
      type: 'rect',
      size: [110, 26],
      style: {
        fill: 'rgba(124, 92, 255, 0.14)',
        stroke: 'rgba(124, 92, 255, 0.5)',
        radius: 7,
      },
      labelCfg: {
        style: {
          fill: '#edf0f7',
          fontSize: 12,
          background: { fill: 'transparent' },
        },
      },
    },
    defaultEdge: {
      type: 'cubic-horizontal',
      style: {
        stroke: 'rgba(148, 163, 184, 0.45)',
        lineWidth: 1.4,
      },
    },
  });

  graph.data(TREE);
  graph.render();
  graph.fitView();

  // 双击追加子节点
  graph.on('node:dblclick', (evt: any) => {
    const model = evt.item.getModel();
    seq += 1;
    graph?.addChild({ id: `n${seq}`, label: `新节点 ${seq}` } as TreeGraphData, model.id as string);
  });
});

const fit = () => {
  graph?.fitView();
}

const exportJson = () => {
  if (!graph) return;
  jsonView.value = JSON.stringify(graph.get('data'), null, 2);
}

onBeforeUnmount(() => {
  graph?.destroy();
  graph = null;
});
</script>

<style lang="less" scoped>
.mind-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  min-height: 480px;
  padding: 20px;

  &__title {
    margin: 0 0 6px;
    color: var(--ai-text);
    font-size: 18px;
  }

  &__desc {
    margin: 0 0 4px;
    color: var(--ai-text-dim);
    font-size: 13px;
  }

  &__actions {
    display: flex;
    gap: 8px;
    margin-bottom: 6px;
  }

  &__json {
    margin: 0;
    max-height: 160px;
    overflow: auto;
    padding: 12px;
    border-radius: var(--ai-radius-sm);
    background: var(--ai-surface);
    border: 1px solid var(--ai-hairline);
    color: var(--ai-text-dim);
    font-family: var(--ai-font-mono);
    font-size: 10.5px;
    line-height: 1.6;
    white-space: pre-wrap;
  }
}

.mind-btn {
  height: 30px;
  padding: 0 14px;
  border: 1px solid var(--ai-border);
  border-radius: 8px;
  background: var(--ai-surface);
  color: var(--ai-text-dim);
  font-size: 12px;
  cursor: pointer;

  &:hover {
    color: var(--ai-text);
    border-color: rgba(124, 92, 255, 0.4);
  }
}

.mind-canvas {
  flex: 1;
  min-height: 420px;
  border: 1px solid var(--ai-border);
  border-radius: var(--ai-radius-md);
  background: var(--ai-surface);
  overflow: hidden;
}
</style>
