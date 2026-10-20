<template>
  <div class="workflow-graph">
    <div id="workflow-graph"></div>
    <TeleportContainer />
    <icon-origin class="pmg-graph-topb" @click="positionContent"></icon-origin>
    <te-slider
      class="pmg-graph-slider"
      v-model="zoomValue"
      :min="MIN_ZOOM"
      :max="MAX_ZOOM"
      :step="10"
      size="small"
      :show-input="true"
      :debounce="500"
      :format-tooltip="
        () => {
          return zoomValue + '%';
        }
      "
      @input="handleZoom"
    />
    <te-dropdown>
      <te-button class="pmg-graph-export" type="default" plain >
        导出图片
        <icon-down class="pl-header-dropdown-icon" />
      </te-button>
      <template #dropdown>
        <te-dropdown-menu>
          <te-dropdown-item @click="handleExport('JPG')">JPG</te-dropdown-item>
          <te-dropdown-item @click="handleExport('PNG')">PNG</te-dropdown-item>
          <te-dropdown-item @click="handleExport('SVG')">
            SVG&nbsp;&nbsp;
            <te-popover placement="top-start" trigger="hover" content="矢量图形格式，缩放不会变形，可用浏览器打开">
              <template #reference>
                <icon-explain></icon-explain>
              </template>
            </te-popover>
          </te-dropdown-item>
        </te-dropdown-menu>
      </template>
    </te-dropdown>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue';
import { TeButton,TeSlider,TeDropdown,TeDropdownItem,TePopover ,TeDropdownMenu} from '@tiansu/element-plus';
import { toSvg,toPng,toJpeg } from 'html-to-image';
import moment from 'moment';
import { debounce } from 'lodash';
import { Graph, Cell, Edge } from '@antv/x6';
import { getTeleport } from '@antv/x6-vue-shape';
import { useRegister } from './use-register-cell';
import { autoLayout } from './use-auto-layout';
import WorkflowApi from './apis/WorkflowApi';
import { ProcessNodeTypeEnum } from '../../models/ProcessNodeTypeEnum';
import { NodeShapeType } from './models/enum/workflow';
import { Axios } from 'axios';
import { IconOrigin,IconExplain,IconDown } from '@arco-iconbox/vue-te/esm';
import { Scroller } from '@antv/x6-plugin-scroller';
const props = defineProps<{
  axios: Axios;
  processInstanceId: string;
  tenantId: string;
}>();
// 定义 Graph 类型的接口
const graph = ref(null) as unknown as Ref<Graph>;
//注册vue3适配antv x6节点
const TeleportContainer = getTeleport();
//画布的缩放值
const zoomValue = ref(100);
const MAX_ZOOM = 200;
const MIN_ZOOM = 50;
//注册自定义节点和自定义边模版
const { registerNodes, registerEdges } = useRegister();
registerNodes();
registerEdges();

onMounted(() => {
  getTaskDetail();
});
/**
 * 画布的缩放值变更
 */
const handleZoom = () => {
  if (!graph.value) {
    return;
  }
  graph.value.zoomTo(zoomValue.value / 100);
};
const positionContent = () => {
  let node = graph.value.getCellById('Event_beginNode');
  graph.value.positionCell(node, 'top', { padding: { vertical: 48 } });
};
let workflowData = []; //画图json
let executedNodeIds = []; //已执行的节点id

/**
 * 获取流程图数据
 */
const getTaskDetail = () => {
  if (props.axios && props.processInstanceId) {
    WorkflowApi.getProcessDiagram(props.axios!, props.tenantId || '', {
      processInstanceId: props.processInstanceId,
      fetchParts: ['INSTANCE_PROGRESS'],
    }).then((data) => {
      if (data.errcode === '0') {
        workflowData = JSON.parse(data.data?.diagramDrawingJson || '[]');
        executedNodeIds = data.data?.executedNodeIds || [];
        initGraph();
      }
    });
  }
};
/**
 * 初始化画布
 */
const initGraph = async () => {
  await createGraph();
  const cells: Cell[] = [];
  workflowData.forEach((item) => {
    if (item.shape.indexOf('edge') > 0) {
      item.shape = 'line-edge';
      let e = graph.value.createEdge(item);
      cells.push(e);
    } else {
      Object.assign(item, nodeOptions(item.shape));
      cells.push(graph.value.createNode(item));
    }
  });
  graph.value.resetCells(cells);

  setTimeout(() => {
    // 染色已执行节点的线
    //染色方法
    const selectEdges = (edges: Edge[]) => {
      edges.forEach((edge) => {
        if (edge.shape.indexOf('_executed') === -1) {
          edge.prop('shape', edge.shape + '_executed');
          graph.value.removeEdge(edge);
          graph.value.addEdge(graph.value.createEdge(edge));
        }
      });
    };
    executedNodeIds.forEach((id) => {
      let node = graph.value.getCellById(id);
      if (
        node &&
        node.data &&
        (node.data.type === ProcessNodeTypeEnum.START_EVENT ||
          node.data.type === ProcessNodeTypeEnum.USER_TASK ||
          node.data.type === ProcessNodeTypeEnum.OUTER_FLOW ||
          node.data.type === ProcessNodeTypeEnum.SEQUENCE_FLOW)
      ) {
        /**
         * 染色逻辑1：node节点的出节点也执行过，那么node节点的出线染色，这里排除分支节点，因为分支节点有多条出线，逻辑不好写
         */
        let outNodes = graph.value.getNeighbors(node, { outgoing: true });
        let outNode = outNodes && outNodes[0];
        let outEdges = graph.value.getOutgoingEdges(node) || [];
        if (outNode.data.type === NodeShapeType.CONDITION_END) {
          outEdges.push(...(graph.value.getOutgoingEdges(outNode) || []));
          //node节点的出节点是分支结束节点的话，再往下找出节点
          outNodes = graph.value.getNeighbors(outNode, { outgoing: true });
          let outNodeEnd = outNodes && outNodes[0];
          while (outNodeEnd.data.type === NodeShapeType.CONDITION_END) {
            outEdges.push(...(graph.value.getOutgoingEdges(outNodeEnd) || []));
            outNodes = graph.value.getNeighbors(outNodeEnd, { outgoing: true });
            outNodeEnd = outNodes && outNodes[0];
          }
          if (executedNodeIds.includes(outNodeEnd.id)) {
            selectEdges(outEdges || []);
          }
        } else {
          if (executedNodeIds.includes(outNode.id)) {
            selectEdges(outEdges || []);
          }
        }

        /**
         * 染色逻辑2：分支节点的分支的进线也要染色，补充逻辑1里面不考虑分支节点的情况
         */
        if (node.data.type === ProcessNodeTypeEnum.SEQUENCE_FLOW) {
          let inEdges = graph.value.getIncomingEdges(node);
          selectEdges(inEdges || []);
        }
      }
    });
    autoLayout(graph.value);
    positionContent();
  }, 200);
};
/**
 * 创建画布
 */
const createGraph = async () => {
  graph.value = new Graph({
    container: document.getElementById('workflow-graph') as HTMLElement,
    autoResize: true,
    translating: { restrict: true },
    //缩放限制
    scaling: { min: 0.5, max: 3 },
    //禁止移动
    interacting: {
      nodeMovable: false,
    },
    background: {
      color: '#F2F3F5',
    },
    connecting: {
      router: 'orth',
    },
  });
  graph.value.use(
    new Scroller({
      enabled: true,
      padding: { top: 48, bottom: 48 },
    })
  );
};
const nodeOptions = (shape: string) => {
  return {
    size: computerNodeSize(shape),
    zIndex: 999,
    visible: true,
    ports: {
      groups: {
        group1: {
          position: 'bottom',
        },
      },
      items: [
        {
          id: 'port1',
          group: 'group1',
          attrs: {
            circle: {
              r: 0,
              magnet: false,
              strokeWidth: 0,
            },
          },
        },
      ],
    },
  };
};
/**
 * 根据节点类型，返回不同节点尺寸
 */
const computerNodeSize = (shape: string) => {
  const shapeObj: {
    [key: string]: { width: number; height: number };
  } = {
    [NodeShapeType.BEGIN]: {
      width: 48,
      height: 48,
    },
    [NodeShapeType.END]: {
      width: 48,
      height: 48,
    },
    [NodeShapeType.TASK]: {
      width: 160,
      height: 48,
    },
    [NodeShapeType.OUTER]: {
      width: 160,
      height: 48,
    },
    [NodeShapeType.CONDITION_BEGIN]: {
      width: 0,
      height: 0,
    },
    [NodeShapeType.CONDITION_END]: {
      width: 0,
      height: 0,
    },
    [NodeShapeType.CONDITION_BRANCH]: {
      width: 240,
      height: 86,
    },
  };
  return shapeObj[shape];
};
// 导出
const handleExport = (type: string) => {
  let els = document.getElementsByClassName('x6-graph-svg')[0] as HTMLElement;
  if (els) {
    let callb = (dataUrl: string) => {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download =  `流程图_${moment().format('YYYYMMDD_HHmm')}`;;
      a.click();
    };
    if (type === 'SVG') {
      toSvg(els as HTMLElement).then(callb);
    } else if (type === 'PNG') {
      toPng(els as HTMLElement).then(callb);
    } else if (type === 'JPG') {
      toJpeg(els as HTMLElement).then(callb);
    }
  }
};

const reload = () => {
  getTaskDetail();
};

defineExpose({ reload });
</script>

<style scoped lang="less">
.workflow-graph {
  > ::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }
  > ::-webkit-scrollbar-thumb {
    background-color: var(--te-border-color);
  }
  #workflow-graph{
    display: inline-block;
  }
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  .pmg-graph-slider {
    position: absolute;
    bottom: 20px;
    width: 350px;
    left: 50px;
  }
  .pmg-graph-topb {
    position: absolute;
    bottom: 24px;
    left: 410px;
    width: 16px;
    font-size: var(--te-font-size-h16);
  }
  .pmg-graph-export {
    position: absolute;
    bottom: 20px;
    left: 442px;
    outline: none !important;
  }
  :deep(.x6-graph-svg) {
    background-color: rgb(242, 243, 245);
  }
}
</style>
