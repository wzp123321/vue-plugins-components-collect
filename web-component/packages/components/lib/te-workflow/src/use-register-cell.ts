import { register } from '@antv/x6-vue-shape';
import { Graph } from '@antv/x6';
import {
  wpmNodeBegin,
  wpmNodeEnd,
  wpmNodeTask,
  wpmNodeConditionBegin,
  wpmNodeConditionEnd,
  wpmNodeConditionTask,
  wpmNodeServiceTask,
} from './components';
import { NodeShapeType, EdgeShapeType } from './models/enum/workflow';

/**
 * 注册自定义节点和自定义边
 * @returns
 */
export const useRegister = () => {
  const registerNodes = () => {
    register({
      shape: NodeShapeType.BEGIN,
      zIndex: 999,
      component: wpmNodeBegin,
    });
    register({
      shape: NodeShapeType.END,
      zIndex: 999,
      component: wpmNodeEnd,
    });
    register({
      shape: NodeShapeType.TASK,
      zIndex: 999,
      component: wpmNodeTask,
    });
    register({
      shape: NodeShapeType.OUTER,
      zIndex: 999,
      component: wpmNodeServiceTask,
    });
    register({
      shape: NodeShapeType.CONDITION_BEGIN,
      zIndex: 999,
      component: wpmNodeConditionBegin,
    });
    register({
      shape: NodeShapeType.CONDITION_END,
      zIndex: 999,
      component: wpmNodeConditionEnd,
    });
    register({
      shape: NodeShapeType.CONDITION_BRANCH,
      zIndex: 999,
      component: wpmNodeConditionTask,
    });
  };

  const registerEdges = () => {
    Graph.registerEdge(
      EdgeShapeType.ARROWEDGE,
      {
        zIndex: 1,
        inherit: 'edge',
        attrs: {
          line: {
            stroke: '#CDD0D6',
            strokeWidth: 2,
          },
        },
      },
      true
    );
    Graph.registerEdge(
      EdgeShapeType.ARROWEDGE + '_executed',
      {
        zIndex: 1,
        inherit: 'edge',
        attrs: {
          line: {
            stroke: '#1890FF',
            strokeWidth: 2,
          },
        },
      },
      true
    );

    // 自定义边
    Graph.registerEdge(
      EdgeShapeType.LINEEDGE,
      {
        zIndex: 1,
        attrs: {
          line: {
            strokeWidth: 2,
            stroke: '#CDD0D6',
            sourceMarker: null,
            targetMarker: null,
          },
        },
      },
      true
    );
    Graph.registerEdge(
      EdgeShapeType.LINEEDGE + '_executed',
      {
        zIndex: 1,
        attrs: {
          line: {
            strokeWidth: 2,
            stroke: '#1890FF',
            sourceMarker: null,
            targetMarker: null,
          },
        },
      },
      true
    );
  };

  return {
    registerNodes,
    registerEdges,
  };
};
