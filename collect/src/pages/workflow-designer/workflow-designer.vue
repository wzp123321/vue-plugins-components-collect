<template>
  <div class="flow-page">
    <aside class="flow-panel">
      <h4 class="flow-panel__title">审批流设计器</h4>
      <p class="flow-panel__desc">LogicFlow 内核；双击节点改名，拖动连线串流程</p>

      <div class="flow-panel__section">
        <span class="flow-panel__label">添加节点</span>
        <button class="flow-panel__btn" @click="addNode('circle', '发起人')">⭕ 开始/发起</button>
        <button class="flow-panel__btn" @click="addNode('rect', '审批节点')">▭ 审批节点</button>
        <button class="flow-panel__btn" @click="addNode('ellipse', '抄送')">Ellipse 抄送</button>
      </div>

      <div class="flow-panel__section">
        <span class="flow-panel__label">图数据</span>
        <button class="flow-panel__btn flow-panel__btn--primary" @click="exportJson">导出 JSON</button>
        <button class="flow-panel__btn" @click="importJson">导入 JSON</button>
        <button class="flow-panel__btn" @click="resetDemo">恢复示例</button>
      </div>

      <p class="flow-panel__tip">
        导出的 JSON 就是入库协议：nodes/edges + 自定义 properties
        （审批人、条件表达式都挂在 properties 上）。
      </p>
      <pre v-if="jsonView" class="flow-panel__json">{{ jsonView }}</pre>
    </aside>

    <div ref="canvasEl" class="flow-canvas"></div>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import LogicFlow from '@logicflow/core';
import '@logicflow/core/es/style/index.css';

defineOptions({ name: 'WorkflowDesignerDemo' });

const canvasEl = ref<HTMLElement | null>(null);
const jsonView = ref('');
let lf: LogicFlow | null = null;
let nodeSeq = 100;

const DEMO_DATA = {
  nodes: [
    { id: 'start', type: 'circle', x: 100, y: 200, text: '发起人' },
    { id: 'a1', type: 'rect', x: 320, y: 200, text: '部门主管' },
    { id: 'a2', type: 'rect', x: 540, y: 200, text: '财务审批' },
    { id: 'end', type: 'circle', x: 760, y: 200, text: '结束' },
  ],
  edges: [
    { sourceNodeId: 'start', targetNodeId: 'a1', type: 'polyline', text: '提交' },
    { sourceNodeId: 'a1', targetNodeId: 'a2', type: 'polyline', text: '金额>1万' },
    { sourceNodeId: 'a2', targetNodeId: 'end', type: 'polyline', text: '通过' },
  ],
};

onMounted(() => {
  if (!canvasEl.value) return;
  lf = new LogicFlow({
    container: canvasEl.value,
    grid: { size: 16, visible: true, type: 'dot' },
    background: { backgroundColor: 'transparent' },
    keyboard: { enabled: true },
  });
  lf.render(DEMO_DATA);

  lf.on('node:click', ({ data }: { data: Record<string, unknown> }) => {
    jsonView.value = JSON.stringify(data, null, 2);
  });
});

const addNode = (type: string, text: string) => {
  if (!lf) return;
  nodeSeq += 1;
  lf.addNode({
    id: `n${nodeSeq}`,
    type,
    x: 180 + Math.random() * 400,
    y: 90 + Math.random() * 220,
    text: `${text} ${nodeSeq}`,
    properties: { approver: '', condition: '' },
  });
}

const exportJson = async () => {
  if (!lf) return;
  jsonView.value = JSON.stringify(lf.getGraphData(), null, 2);
}

const importJson = async () => {
  if (!lf || !jsonView.value) {
    exportJson();
    return;
  }
  try {
    lf.render(JSON.parse(jsonView.value));
  } catch {
    jsonView.value = '// JSON 解析失败';
  }
}

const resetDemo = () => {
  lf?.render(DEMO_DATA);
  jsonView.value = '';
}

onBeforeUnmount(() => {
  // LogicFlow 内部监听在容器销毁时随 DOM 回收，这里主动置空引用即可
  lf = null;
});
</script>

<style lang="less" scoped>
.flow-page {
  display: flex;
  height: 100%;
  min-height: 480px;
  padding: 16px;
  gap: 14px;
}

.flow-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 220px;
  flex-shrink: 0;
  padding: 14px;
  border: 1px solid var(--ai-border);
  border-radius: var(--ai-radius-md);
  background: var(--ai-surface-raised);

  &__title {
    margin: 0;
    color: var(--ai-text);
    font-size: 15px;
  }

  &__desc {
    margin: 0;
    color: var(--ai-text-mute);
    font-size: 11.5px;
    line-height: 1.6;
  }

  &__section {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__label {
    color: var(--ai-text-mute);
    font-family: var(--ai-font-mono);
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  &__btn {
    height: 30px;
    border: 1px solid var(--ai-border);
    border-radius: 8px;
    background: var(--ai-surface);
    color: var(--ai-text-dim);
    font-size: 12px;
    text-align: left;
    padding: 0 10px;
    cursor: pointer;

    &:hover {
      color: var(--ai-text);
      border-color: rgba(124, 92, 255, 0.4);
    }

    &--primary {
      background: var(--ai-gradient-soft);
      border-color: rgba(124, 92, 255, 0.35);
      color: var(--ai-text);
    }
  }

  &__tip {
    margin: 0;
    color: var(--ai-text-mute);
    font-size: 10.5px;
    line-height: 1.6;
  }

  &__json {
    margin: 0;
    max-height: 200px;
    overflow: auto;
    padding: 10px;
    border-radius: 8px;
    background: var(--ai-surface);
    border: 1px solid var(--ai-hairline);
    color: var(--ai-text-dim);
    font-family: var(--ai-font-mono);
    font-size: 10.5px;
    line-height: 1.6;
  }
}

.flow-canvas {
  flex: 1;
  min-width: 0;
  border: 1px solid var(--ai-border);
  border-radius: var(--ai-radius-md);
  background: var(--ai-surface);
  overflow: hidden;
}
</style>
