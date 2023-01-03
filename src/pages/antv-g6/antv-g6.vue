<template>
  <div class="antv-g6" id="antv-g6"></div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import G6, { registerNode, TreeGraph } from '@antv/g6';
import { dataSource, Antv_ITreeData } from './antv-g6.api';

let chart: TreeGraph;
const WIDTH = 132;
const HEIGHT = 72;
const isVertical = ref<boolean>(true);
const collapseIconSize = 20;

function initG6() {
  const container = document.querySelector('#antv-g6') as HTMLElement;
  if (!container) {
    return;
  }
  const width = container.scrollWidth;
  const height = container.scrollHeight;

  chart = new G6.TreeGraph({
    container,
    width,
    height,
    fitView: true, // 适应容器
    fitViewPadding: [20],
    minZoom: 0.5,
    maxZoom: 2, // 放大视图
    modes: {
      default: ['drag-canvas', 'zoom-canvas'],
    },
    defaultNode: {
      type: 'emperor-card',
    },
    // 默认连线
    defaultEdge: {
      type: 'cubic-' + (isVertical.value ? 'vertical' : 'horizontal'),
      style: {
        stroke: '#979797',
        lineWidth: 1,
      },
    },

    layout: {
      type: 'compactBox',
      direction: isVertical.value ? 'TB' : 'LR',
      getVGap() {
        // 每个节点的垂直间隔
        return isVertical.value ? 20 + collapseIconSize : 15;
      },
      getHGap() {
        // 每个节点的水平间隔
        return isVertical.value ? 65 : 50;
      },
    },
  });

  G6.registerEdge('flow-line', {
    draw(cfg: any, group: any) {
      const startPoint = cfg.startPoint;
      const endPoint = cfg.endPoint;

      const { style } = cfg;
      const shape = group.addShape('path', {
        attrs: {
          stroke: style.stroke,
          endArrow: style.endArrow,
          path: [
            ['M', startPoint.x, startPoint.y],
            ['L', startPoint.x, (startPoint.y + endPoint.y) / 2],
            ['L', endPoint.x, (startPoint.y + endPoint.y) / 2],
            ['L', endPoint.x, endPoint.y],
          ],
        },
      });

      return shape;
    },
  });

  chart.data(convert(dataSource));
  chart.render();
  chart.fitCenter();

  if (typeof window !== 'undefined')
    window.onresize = () => {
      if (!chart || chart.get('destroyed')) return;
      if (!container || !container.scrollWidth || !container.scrollHeight) return;
      chart.changeSize(container.scrollWidth, container.scrollHeight);
    };
}

/**
 * 注册节点、连线等
 */
function register() {
  G6.Marker.collapse = (x, y, r) => {
    return [
      ['M', x - r, y],
      ['a', r, r, 0, 1, 0, r * 2, 0],
      ['a', r, r, 0, 1, 0, -r * 2, 0],
      ['M', x - r + 6, y],
      ['L', x + r - 6, y],
    ];
  };
  G6.Marker.expand = (x, y, r) => {
    return [
      ['M', x - r, y],
      ['a', r, r, 0, 1, 0, r * 2, 0],
      ['a', r, r, 0, 1, 0, -r * 2, 0],
      ['M', x - r + 6, y],
      ['L', x - r + 2 * r - 6, y],
      ['M', x - r + r, y - r + 6],
      ['L', x, y + r - 6],
    ];
  };

  registerNode('emperor-card', {
    options: {
      stroke: '#91d5ff',
      fill: '#91d5ff',
    },
    draw: (config, group) => {
      const shape = group!.addShape('rect', {
        attrs: {
          ...getRightPosition({ x: 0, y: 0 }, WIDTH, HEIGHT),
          width: WIDTH,
          height: HEIGHT,
          lineWidth: 1,
          fontSize: 12,
          fill: '#fff',
          radius: 4,
          shadowOffsetX: 0, // 阴影
          shadowOffsetY: 3,
          shadowColor: '#E9F0F6',
          shadowBlur: 10,
        },
        draggable: true,
      });
      // 文本
      group?.addShape('text', {
        attrs: {
          ...getRightPosition({ x: 0, y: 0 }, 100, 22),
          text: config?.label,
          fill: 'rgba(0, 0, 0, 0.65)',
          lineHeight: 20,
          fontSize: 18,
          textAlign: 'center',
          textBaseline: 'middle',
        },
      });
      // 头像
      group?.addShape('image', {
        name: 'cover-image-shape',
        attrs: {
          ...getRightPosition({ x: 0, y: 0 }, WIDTH, HEIGHT),
          width: HEIGHT,
          height: HEIGHT,
          img: config?.coverUrl,
        },
      });
      return shape;
    },
    getAnchorPoints: () => [
      [0, 0.5],
      [1, 0.5],
    ],
  });
}

function convert(data: Antv_ITreeData, deep = 0, color = '#128BED'): any {
  const { children, label, position, coverUrl } = data;
  return {
    id: data.id,
    color,
    label,
    collapsed: false,
    coverUrl,
    size: [mapLabelWidth(label) + (deep % 2 ? 0 : 32), 37, ...mapPaddingWidth(deep, position), 0],
    children: children?.map((item) => convert(item, deep + 1)),
  };
}
function mapLabelWidth(label: string): number {
  const element = document.createElement('span');
  element.style.visibility = 'hidden';
  element.style.position = 'absolute';
  element.style.fontSize = '14px';
  element.textContent = label;
  document.body.appendChild(element);
  const width = element.clientWidth;
  document.body.removeChild(element);
  return width;
}
function mapPaddingWidth(deep: number, position?: 'left' | 'right'): number[] {
  switch (position) {
    case 'left':
      return [26, deep % 2 ? 45 : 0];
    case 'right':
      return [deep % 2 ? 45 : 0, 26];
    default:
      return [0, 0];
  }
}
/**
 * 处理定位
 */
function getRightPosition({ x, y }: { x: number; y: number }, w: number, h: number) {
  return {
    x: x - w / 2,
    y: y - h / 2,
  };
}

onMounted(() => {
  register();
  initG6();
});
</script>
<style lang="less" scoped>
#antv-g6 {
  width: 100%;
  height: 100%;
}
</style>
