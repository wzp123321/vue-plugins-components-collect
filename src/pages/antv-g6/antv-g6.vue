<template>
  <div class="antv-g6" id="antv-g6"></div>
</template>
<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';
import G6, { registerNode, TreeGraph } from '@antv/g6';
import { dataSource, Antv_ITreeData } from './antv-g6.api';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

const destroy$ = new Subject<void>();
let chart: TreeGraph;
const isVertical = ref<boolean>(true);
const collapseIconSize = 20;
const WIDTH = 270 + (isVertical.value ? 0 : collapseIconSize);
const HEIGHT = 152 + (isVertical.value ? collapseIconSize : 0);
// 生成样式、事件
const iconStateStyles: { [key: string]: any } = {};
const iconEvents: { [key: string]: any } = {};
const iconTypes = ['negative', 'difference', 'increase', 'decrease', 'unauthorized'];
const textStateStyles: { [key: string]: any } = {};
const textEvents: { [key: string]: any } = {};
const textTypes = ['title', 'value1', 'value2', 'mark1', 'mark2'];
iconTypes.forEach((ele) => {
  iconStateStyles[`mouseover:${ele}`] = {
    [`icon-${ele}-tooltip-arrow`]: {
      opacity: 0.85,
    },
    [`icon-${ele}-tooltip-rect`]: {
      opacity: 0.85,
      stroke: 'rgba(0, 0, 0, .65)',
    },
    [`icon-${ele}-tooltip-text`]: {
      opacity: 0.85,
    },
  };
  iconEvents[`icon-${ele}-bg:mouseover`] = 'onMouseover';
  iconEvents[`icon-${ele}:mouseover`] = 'onMouseover';
  iconEvents[`icon-${ele}-bg:mouseout`] = 'onMouseout';
  iconEvents[`icon-${ele}:mouseout`] = 'onMouseout';
});
textTypes.forEach((ele) => {
  textStateStyles[`mouseover:${ele}`] = {
    [`text-${ele}-tooltip-arrow`]: {
      opacity: 0.85,
    },
    [`text-${ele}-tooltip-rect`]: {
      opacity: 0.85,
      stroke: 'rgba(0, 0, 0, 0.65)',
    },
    [`text-${ele}-tooltip-text`]: {
      opacity: 0.85,
    },
  };
  textEvents[`text-${ele}:mouseover`] = 'onMouseover';
  textEvents[`text-${ele}:mouseout`] = 'onMouseout';
});
const textConfig = {
  fontFamily: 'PingFangSC-Regular',
};

function initG6() {
  const container = document.querySelector('#antv-g6') as HTMLElement;
  if (!container) {
    return;
  }
  const width = container.scrollWidth;
  const height = container.scrollHeight;

  if (chart && !chart.destroyed) {
    chart.destroy();
  }

  chart = new G6.TreeGraph({
    container,
    width,
    height,
    // fitView: true, // 适应容器
    fitViewPadding: [20],
    minZoom: 0.5,
    maxZoom: 2, // 放大视图
    modes: {
      default: ['drag-canvas', 'zoom-canvas', 'drag-node'],
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
      preventOverlap: true, // 防止节点重叠
      direction: isVertical.value ? 'TB' : 'LR',
      getVGap() {
        // 每个节点的垂直间隔
        return isVertical.value ? 80 + collapseIconSize : 65;
      },
      getHGap() {
        // 每个节点的水平间隔
        return isVertical.value ? 135 : 180;
      },
    },
    // 不同状态下节点样式
    nodeStateStyles: {
      ...iconStateStyles,
      ...textStateStyles,
    },
  });

  chart.data(convert(dataSource));
  chart.render();
  chart.fitCenter();
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
        options: {
          size: [270 + (isVertical.value ? 0 : collapseIconSize), 152 + (isVertical.value ? collapseIconSize : 0)],
          stroke: '#91d5ff',
          fill: '#91d5ff',
        },
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
      // 背景
      const img = new Image();
      img.src = require('../../assets/images/g6/g6-card-background.svg');
      group?.addShape('image', {
        attrs: {
          ...getRightPosition({ x: 0, y: 0 }, WIDTH, HEIGHT),
          img,
          width: WIDTH,
          height: HEIGHT,
          shadowOffsetX: 0, // 阴影
          shadowOffsetY: 3,
          shadowColor: '#E9F0F6',
          shadowBlur: 10,
          draggable: true,
          cursor: 'pointer',
        },
        name: 'card',
      });
      // 文本
      group?.addShape('text', {
        attrs: {
          ...getRightPosition({ x: 72, y: 20 }, WIDTH, HEIGHT),
          text: config?.label,
          fill: 'rgba(0, 0, 0, 0.65)',
          lineHeight: 22,
          fontSize: 16,
          textAlign: 'left',
          textBaseline: 'middle',
        },
      });
      // 头像
      group?.addShape('image', {
        name: 'cover-image-shape',
        attrs: {
          ...getRightPosition({ x: 0, y: 0 }, WIDTH, HEIGHT),
          width: 64,
          height: 64,
          img: config?.coverUrl,
          radius: 100,
        },
      });
      // 朝代
      if (config?.isRoot) {
        const tipIconSize = 24;
        const fill = 'rgba(250, 140, 22)';
        const position = {
          x: WIDTH - tipIconSize - (isVertical.value ? 0 : collapseIconSize),
          y: 0,
        };
        group?.addShape('rect', {
          attrs: {
            ...getRightPosition(position, WIDTH, HEIGHT),
            width: tipIconSize,
            height: tipIconSize,
            radius: [2, 8, 2, 2],
            fill,
            cursor: 'pointer',
          },
          name: 'dynasty-icon',
        });
        group?.addShape('text', {
          attrs: {
            ...getRightPosition(
              {
                x: position.x + 12,
                y: position.y + 20,
              },
              WIDTH,
              HEIGHT,
            ),
            textAlign: 'center',
            ...textConfig,
            width: tipIconSize,
            height: tipIconSize,
            fontSize: 16,
            text: config?.dynasty,
            fill: '#fff',
            shadowOffsetX: 0, // 阴影
            shadowOffsetY: 2,
            shadowColor: 'rgba(0, 0, 0, 0.2)',
            shadowBlur: 4,
            cursor: 'pointer',
          },
          name: 'dynasty-text',
        });
      }
      return shape;
    },
    // 节点的连接点 anchorPoint
    getAnchorPoints: () => [
      [0.5, 0],
      [0.5, 1],
    ],
  });
}

function convert(data: Antv_ITreeData, deep = 0, color = '#128BED'): any {
  const { children, label, position, coverUrl, isRoot, dynasty } = data;
  return {
    id: data.id,
    color,
    label,
    collapsed: false,
    coverUrl,
    isRoot,
    dynasty,
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

  fromEvent(window, 'resize')
    .pipe(takeUntil(destroy$))
    .subscribe(() => {
      const container = document.querySelector('#antv-g6') as HTMLElement;
      if (!container) {
        return;
      }
      chart.changeSize(container.scrollWidth, container.scrollHeight);
    });
});
onUnmounted(() => {
  destroy$.next();
  destroy$.complete();
});
</script>
<style lang="less" scoped>
#antv-g6 {
  width: 100%;
  height: 100%;
}
</style>
