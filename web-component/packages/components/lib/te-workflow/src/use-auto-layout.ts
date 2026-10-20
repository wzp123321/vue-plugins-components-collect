import dagre from '@tiansu/custom-dagre';
import { NodeShapeType } from './models/enum/workflow';
import { Cell, Graph, Node } from '@antv/x6';

interface TerminalCell {
  cell: string;
}
// 自动布局
export const autoLayout = (graph: Graph) => {
  const rankObj = calculateRank(graph, 'Event_beginNode');
  const orderObj = calculateOrder(graph, rankObj, 'Event_beginNode');
  const nodes = graph.getNodes();
  const edges = graph.getEdges();
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'TB', nodesep: 100, ranksep: 82, ranker: 'longest-path' });
  g.setDefaultEdgeLabel(() => ({}));
  nodes.forEach((node) => {
    let rank = rankObj[node.id];
    let order = orderObj[node.id];
    g.setNode(node.id, {
      width: node.size().width,
      height: node.size().height,
      rank: rank ? rank : 0,
      order: order ? order : 0,
    });
  });

  edges.forEach((edge) => {
    const source = edge.getSource() as unknown as TerminalCell;
    const target = edge.getTarget() as unknown as TerminalCell;
    g.setEdge(source.cell, target.cell, { minlen: 1 });
  });
  dagre.layout(g);

  g.nodes().forEach((id: string) => {
    const node = graph.getCellById(id) as Node;
    if (node) {
      const pos = g.node(id);
      let x = pos.x - pos.width / 2;
      let y = pos.y - pos.height / 2;
      node.position(x, y);
    }
  });

  edges.forEach((edge) => {
    const source = edge.getSourceNode()!;
    const target = edge.getTargetNode()!;
    const sourceBBox = source.getBBox();
    const targetBBox = target.getBBox();

    const targetNode = graph.getCellById(target.id) as Node;

    if (targetNode.shape === NodeShapeType.CONDITION_END) {
      // edge.setVertices([{ x: sourceBBox.center.x, y: sourceBBox.center.y + 100 }]);
      const gap = targetBBox.y - sourceBBox.y - sourceBBox.height;
      const fix = sourceBBox.height;
      const y = sourceBBox.y + fix + gap / 2;
      edge.setVertices([
        { x: sourceBBox.center.x, y },
        // { x: targetBBox.center.x, y },
      ]);
    } else {
      edge.setVertices([]);
    }
  });
};

//计算层级排序
const calculateRank = (graph: Graph, startNodeId: string) => {
  console.log(999, graph);
  // 获取起始节点和结束节点
  const startNode = graph.getCellById(startNodeId);
  const obj: { [p: string]: number } = {};
  const queryRank = (node: Cell, distance: number) => {
    let x: number = obj[node.id] || 0;
    obj[node.id] = Math.max(x, distance);
    node.data.rank = obj[node.id];
    graph.getNeighbors(node, { outgoing: true }).forEach((neighbor) => {
      queryRank(neighbor, distance + 1);
    });
  };

  queryRank(startNode, 0);
  return obj;
};

//DAG图同层级排序
const calculateOrder = (graph: Graph, rankObj: { [p: string]: number }, startNodeId: string) => {
  //第一步，构建层级二维数组
  let maxRank = 0;
  Object.keys(rankObj).forEach((key) => {
    if (rankObj[key] > maxRank) {
      maxRank = rankObj[key];
    }
  });
  let orderRankArr: { id: string; order: number }[][] = new Array(maxRank + 1).fill(null).map(() => []);
  //第二步，从起始节点开始，逐层遍历
  const startNode = graph.getCellById(startNodeId);
  const records: string[] = [];
  let obj: { [p: string]: number } = {};
  let rankEndOrderArr = new Array(maxRank + 1).fill(0); //每一层的尾标
  const queryLong = (node: Cell, rank: number) => {
    let sameRankarr = graph.getNeighbors(node, { outgoing: true });
    //将指定节点的直接子层级进行紧凑排序
    sameRankarr.sort((a, b) => {
      return a.data.order - b.data.order;
    });
    sameRankarr.forEach((neighbor) => {
      if (records.indexOf(neighbor.id) === -1) {
        neighbor.data.order = rankEndOrderArr[rank];
        rankEndOrderArr[rank] = rankEndOrderArr[rank] + 1;
        obj[neighbor.id] = neighbor.data.order;
        records.push(neighbor.id);
        orderRankArr[rank].push({
          id: neighbor.id,
          order: neighbor.data.order,
        });
      }
    });
    sameRankarr.forEach((neighbor) => {
      queryLong(neighbor, rank + 1);
    });
  };

  queryLong(startNode, 1);
  obj[startNodeId] = 0;

  // console.log(123, orderRankArr);
  return obj;
};
