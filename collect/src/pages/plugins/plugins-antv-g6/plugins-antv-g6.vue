<template>
  <div class="plugins-antv-g6" id="plugins-antv-g6">
    <div ref="elChart" class="plugins-antv-g6-chart"></div>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import {
  EAD_HOME_ENodeType as EadHomeENodeType,
  EAD_HOME_IBrainMapNode as EadHomeIBrainMapNode,
  IResBrainMapNode,
  mockData,
} from './plugins-antv-g6.api';
import { EadChartService } from './plugins-antv-g6.service';

const elChart = ref<HTMLDivElement>();

const convertToNode = (data: IResBrainMapNode, position?: 'left' | 'right'): EadHomeIBrainMapNode => ({
    id: data.nodeId,
    name: data.nodeName,
    value: data.amount,
    unit: data.unit,
    operateName: data.operateName,
    position: (() => {
      if (position) {
        return position;
      }
      switch (+(data.nodeType ?? undefined)) {
        case EadHomeENodeType.主节点:
          return undefined;
        case EadHomeENodeType.收入:
          position = 'left';
          break;
        case EadHomeENodeType.成本:
          position = 'right';
          break;
        default:
          break;
      }
      return position;
    })(),
    isDeduction: data.deductFlag,
    extensions:
      data.extendTypeData?.map((extension) => ({
        code: extension.code,
        name: extension.name,
        value: extension.value,
        unit: extension.unit,
        color: extension.color,
      })) ?? [],
    energyCode: data.energyCode,
    popup: +data.popupType,
    children: data.children?.map((child) => convertToNode(child, position)!) ?? [],
});

onMounted(() => {
  const eadChart = new EadChartService(elChart.value!);

  eadChart.clear();
  eadChart.render(convertToNode(mockData), false);
});
</script>
<style lang="less" scoped>
#plugins-antv-g6 {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;

  .plugins-antv-g6-chart {
    width: 100%;
    height: 100%;

    :deep(.g6-graph-watermarker) {
      z-index: 0 !important;
    }
  }
}
</style>
