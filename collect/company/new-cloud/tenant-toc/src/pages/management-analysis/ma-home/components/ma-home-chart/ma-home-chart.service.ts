/* eslint-disable @typescript-eslint/no-non-null-assertion */
import store from '@/store';
import { ref } from 'vue';
import {
  TreeLayoutConfig,
  TreeGraph,
  registerNode,
  registerEdge,
  INode,
  Marker,
  TreeGraphData,
  IEdge,
  IG6GraphEvent,
  Item,
} from '@antv/g6';
import { Subject } from 'rxjs';
import {
  MA_HOME_IBrainMapNode,
  MA_HOME_INodeExtensionItem,
  MA_HOME_EDateType,
  MA_HOME_EQueryType,
} from '../../services';
import { RemarkStatus, RpResultVO, MA_H_C_SearchParams } from './ma-h-c-remark-popover/ma-h-c-remark-popover.api';

import commentPopover from './ma-h-c-remark-popover/ma-h-c-remark-popover.service';

const COLORS_INNER = [
  '#D4BD84',
  '#B4C217',
  '#F87EFF',
  '#C26517',
  '#407675',
  '#019898',
  '#8D72A6',
  '#8FB78E',
  '#8284FF',
  '#2FD3DC',
];
const COLORS_OUTER = [
  '#00A5B2',
  '#FE4B4E',
  '#443AFF',
  '#F9AD15',
  '#42B20D',
  '#A83BFF',
  '#85A4FF',
  '#FFCB20',
  '#9FFF3B',
  '#106DD9',
];

export class ChartService {
  private _chart: TreeGraph;
  private _flatCount = new Map<number, number>();
  private _data?: TreeGraphData;
  private _canPopup = false;
  private _activeNodeId = ''; // 高亮
  private _Item: Item | null = null;
  private _searchParams = ref<MA_H_C_SearchParams>({
    queryType: MA_HOME_EQueryType.建设期,
    durationType: MA_HOME_EDateType.按年,
  });

  public set searchParams(value: MA_H_C_SearchParams) {
    this._searchParams.value.durationType = value?.durationType ?? MA_HOME_EDateType.按年;
    this._searchParams.value.queryType = value?.queryType ?? MA_HOME_EQueryType.建设期;
    this._searchParams.value.startDate = value?.startDate ?? '';
    this._searchParams.value.endDate = value?.endDate ?? '';
  }

  public readonly evZoomChange$ = new Subject<number>();

  constructor(container: HTMLDivElement) {
    this.register();
    this._chart = new TreeGraph({
      container,
      modes: {
        default: [
          { type: 'drag-canvas', allowDragOnItem: true },
          { type: 'zoom-canvas', sensitivity: 1 },
        ],
      },
      defaultNode: { type: 'rect' },
      defaultEdge: { type: 'polyline' },
      minZoom: 0.1,
      maxZoom: 3,
      animate: true,
      animateCfg: { duration: 333, easing: 'easePolyIn' },
      layout: {
        type: 'compactBox',
        direction: 'H',
        getWidth: (node: TreeGraphData) => {
          const size = node.size as number[];
          return size[0] + size[2] + size[3];
        },
        getHeight: (node: TreeGraphData) => {
          const size = node.size as number[];
          return size[1] + size[4] * 2;
        },
        getHGap: () => 20,
        getVGap: () => 10,
        getSide: (node: TreeLayoutConfig) => node.data?.side,
      },
    });

    this._chart.setImageWaterMarker(require('../../../../../assets/images/common/common-watermark.svg'), {
      width: 170 + 132,
      height: 110 + 206,
      compatible: false,
      image: { y: 110, width: 170, height: 34, rotate: 30 },
    });

    this._chart.on('node:click', (event) => {
      commentPopover?.close();

      const model = event.item!.getModel() as TreeGraphData;
      switch (event.target.cfg.name) {
        case 'node-box':
        case 'node-text':
        case 'remark-marker':
          if (this._canPopup) {
            store.commit(
              'SET_DIALOG_Data',
              model.base as Omit<MA_HOME_IBrainMapNode, 'position' | 'extensions' | 'children'>,
            );
          }
          break;
        case 'button-toggle':
          model.collapsed = !model.collapsed;
          this._chart.updateItem(event.item!, model);
          this._chart.updateChildren(model.children!, model.id);
          break;
        default:
          break;
      }
    });

    /**
     * 右击事件 拿到标记的坐标 当前缩放比率
     * 打开弹框
     */
    this._chart.on('node:contextmenu', (event) => {
      event.preventDefault();
      event.stopPropagation();

      // 建设期、运营期、实验局的按年（非同年）、按月（非同月）
      if (
        (this._searchParams.value.queryType === MA_HOME_EQueryType.建设期 ||
          this._searchParams.value.queryType === MA_HOME_EQueryType.运营期 ||
          this._searchParams.value.queryType === MA_HOME_EQueryType.实验局) &&
        ((this._searchParams.value.durationType === MA_HOME_EDateType.按年 &&
          this._searchParams.value.startDate &&
          this._searchParams.value.endDate &&
          new Date(String(this._searchParams.value.startDate)).getFullYear() !==
            new Date(String(this._searchParams.value.endDate)).getFullYear()) ||
          (this._searchParams.value.durationType === MA_HOME_EDateType.按月 &&
            this._searchParams.value.startDate &&
            this._searchParams.value.endDate &&
            this._searchParams.value.startDate !== this._searchParams.value.endDate))
      ) {
        return;
      }

      const model = event.item?.getModel() as TreeGraphData;
      this._Item = event.item as Item;
      this._activeNodeId = model?.id ?? '';

      this.openCommentPopover(event, !model?.remark ? RemarkStatus.待插入 : RemarkStatus.已插入);
    });

    // 拖拽
    this._chart.on('drag', () => {
      commentPopover.close();
    });

    this._chart.on('node:mouseover', (event) => {
      switch (event.target.cfg.name) {
        case 'node-box':
        case 'node-text':
          (event.item as INode).getEdges().forEach((edge) => {
            edge.setState('flow', true);
          });
          break;
        default:
          break;
      }

      // 判断当前是否有批注&&移动到三角图形上
      const model = event.item?.getModel() as TreeGraphData;
      if (event.target?.cfg?.name === 'remark-marker' && model?.remark) {
        if (commentPopover.remarkStatus !== RemarkStatus.查看中 && commentPopover.visible) {
          return;
        }
        this.openCommentPopover(event, RemarkStatus.查看中);
      }
    });
    this._chart.on('node:mouseleave', (event) => {
      (event.item as INode).getEdges().forEach((edge) => edge.setState('flow', false));

      setTimeout(() => {
        if (!commentPopover.is_active && commentPopover.remarkStatus === RemarkStatus.查看中) {
          commentPopover.close();
        }
      }, 300);
    });
    this._chart.on('wheelzoom', () => {
      this.evZoomChange$.next(this._chart.getZoom());

      commentPopover.close();
    });
  }

  public render(data: MA_HOME_IBrainMapNode, canPopup: boolean): void {
    console.log('data=================', data);
    this._canPopup = canPopup;
    this._chart.changeData((this._data = this.convert(data)));
    this._chart.fitCenter();
  }

  public clear(): void {
    this._data = undefined; // 重置数据，切换查询条件会出现渲染脑图+无数据情况
    this._activeNodeId = '';
    this._flatCount.clear();
    this._chart.clear();
  }

  public resize(width: number, height: number): void {
    this._chart.changeSize(width, height);
    this._chart.fitCenter();
  }

  public zoom(ratio: number): void {
    ratio = +(ratio + this._chart.getZoom()).toFixed(2);
    ratio = Math.max(ratio, this._chart.getMinZoom());
    ratio = Math.min(ratio, this._chart.getMaxZoom());
    const center = { x: this._chart.getContainer().clientWidth / 2, y: this._chart.getContainer().clientHeight / 2 };
    this._chart.zoomTo(ratio, center, true, {
      duration: 233,
      callback: () => this.evZoomChange$.next(this._chart.getZoom()),
    });

    commentPopover?.close();
  }

  public save(name: string): void {
    this._chart.downloadFullImage(name, 'image/png', { backgroundColor: 'white', padding: 50 });
  }

  public updateItem(params: RpResultVO) {
    const model = this._Item?.getModel();
    if (model && this._Item) {
      model.remark = params.remark;
      model.operateName = params.operateName;
      this._activeNodeId = '';
      this._chart.update(this._Item, model);
    }
  }

  public operate(codes: readonly string[], base: MA_HOME_INodeExtensionItem[]): void {
    commentPopover?.close();

    if (!this._data) {
      return;
    }

    const check = (model: TreeGraphData): void => {
      const extensions = model.extensions as MA_HOME_INodeExtensionItem[];
      extensions.forEach((extension) => {
        extension.order = base.find((item) => item.code === extension.code)?.order;
        extension.visible = codes.includes(extension.code);
      });
      (model.size as number[])[4] = 35 * extensions.filter((extension) => extension.visible).length;
      model.children?.forEach((child) => check(child));
    };
    check(this._data);
    this._chart.changeData(this._data);
    this._chart.fitCenter();
  }

  private convert(data: MA_HOME_IBrainMapNode, deep = 0, color = '#128BED'): TreeGraphData {
    const label = `${data.name} ${data.value ?? '--'}${data.unit ?? ''}`;
    const { position, extensions, children, remark, operateName, ...base } = data;
    return {
      base,
      id: data.id,
      color,
      remark,
      operateName,
      label,
      side: position,
      collapsed: false,
      size: [this.mapLabelWidth(label) + (deep % 2 ? 0 : 32), 37, ...this.mapPaddingWidth(deep, position), 0],
      extensions,
      children: children.map((item) => this.convert(item, deep + 1, this.mapColor(deep + 1) ?? color)),
    };
  }

  private mapLabelWidth(label: string): number {
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

  private mapPaddingWidth(deep: number, position?: 'left' | 'right'): number[] {
    switch (position) {
      case 'left':
        return [26, deep % 2 ? 45 : 0];
      case 'right':
        return [deep % 2 ? 45 : 0, 26];
      default:
        return [0, 0];
    }
  }

  private mapColor(deep: number): string | undefined {
    const count = this._flatCount.get(deep) ?? 0;
    this._flatCount.set(deep, count + 1);

    switch (deep % 4) {
      case 1:
        return COLORS_INNER[count % COLORS_INNER.length];
      case 3:
        return COLORS_OUTER[count % COLORS_OUTER.length];
      default:
        break;
    }
  }

  /**
   * 打开弹框
   * 1.获取node-box的坐标
   * 2.判断右边是否可以展示全
   * @param event 事件对象
   * @param status 弹框状态
   */
  private openCommentPopover(event: IG6GraphEvent, status: number) {
    const zoom = this._chart.getZoom();

    const parent = event.target.getParent();
    parent?.cfg?.children.forEach((item: any) => {
      const model = event?.item?.getModel() as TreeGraphData;
      if (item?.cfg?.name === 'node-box') {
        const offsetLeft = status === RemarkStatus.待插入 || status === RemarkStatus.已插入 ? 6 : 17;
        const offsetTop = status === RemarkStatus.待插入 || status === RemarkStatus.已插入 ? 2 : 17;
        const popoverW = status === RemarkStatus.待插入 || status === RemarkStatus.已插入 ? 119 : 140;
        const containerW = document.getElementById('ma-home')?.clientWidth;
        const containerPadding = 16 + 16 + 8; // 两层容器padding + 滚轮宽度

        const boxMinX = item?.cfg?.cacheCanvasBBox?.minX;
        const boxMaxX = item?.cfg?.cacheCanvasBBox?.maxX;
        const boxY = item?.cfg?.cacheCanvasBBox?.y;
        let left = boxMaxX + offsetLeft;
        // 如果右边展示不下 x + width + padding总和 > containerWidth;展示在左边
        let direction = 'right';

        if (Number(left) + popoverW + containerPadding > Number(containerW)) {
          left = boxMinX - offsetLeft - popoverW - 2;
          direction = 'left';
        }

        const options = {
          nodeId: model?.id,
          left: `${left}px`,
          top: `${boxY - (2 + 1) * zoom - offsetTop}px`,
          direction,
        };
        commentPopover.show(options, status, (model?.remark as string) ?? '', (model?.operateName as string) ?? '');
      }
    });
  }

  private register(): void {
    registerNode('rect', {
      draw: (config, group) => {
        const size = config!.size as number[];
        const shape = group!.addShape('rect', {
          attrs: {
            width: size[0] + size[2] + size[3],
            height: size[1] + size[4] * 2,
          },
          draggable: true,
        });
        group!.addShape('rect', {
          name: 'node-box',
          attrs: {
            x: size[2],
            y: size[4],
            width: size[0],
            height: size[1],
            fill: config?.depth ? 'transparent' : config?.color,
            stroke: (config?.depth as number) % 2 ? 'transparent' : config?.color,
            radius: 2,
            cursor: this._canPopup ? 'pointer' : '',
          },
          draggable: true,
        });
        group!.addShape('text', {
          name: 'node-text',
          attrs: {
            x: size[0] / 2 + size[2],
            y: size[1] / 2 + 1 + size[4],
            text: config?.label,
            fill: config?.depth ? 'rgba(0, 0, 0, 0.65)' : 'white',
            lineHeight: 20,
            fontSize: 14,
            textAlign: 'center',
            textBaseline: 'middle',
            cursor: this._canPopup ? 'pointer' : '',
          },
          draggable: true,
        });

        if (config?.depth && (config?.children as TreeGraphData[])?.length) {
          const x = config!.side === 'left' ? 8 : size[0] + size[2] + size[3] - 8;
          group!.addShape('marker', {
            name: 'button-toggle',
            attrs: {
              x,
              y: size[1] / 2 + size[4],
              r: 8,
              symbol: config.collapsed ? Marker.expand : Marker.collapse,
              stroke: '#979797',
              cursor: 'pointer',
            },
            draggable: true,
          });
        }
        if ((config?.depth as number) % 2) {
          const x = config!.side === 'left' ? size[0] + size[2] + size[3] - 20 : 0;
          group!.addShape('polygon', {
            attrs: {
              points: [
                [x, size[1] / 2 - 5 + size[4]],
                [x, size[1] / 2 + 5 + size[4]],
                [x + 20, size[1] / 2 + size[4]],
              ],
              fill: '#128BED',
            },
            draggable: true,
          });
          group!.addShape('circle', {
            attrs: {
              x: x ? x - 10 : 30,
              y: size[1] / 2 + size[4],
              r: 5,
              fill: config?.color,
            },
            draggable: true,
          });
        }

        const remarkW = 8;
        const remarkOffset = 10;
        // 右上角三角  如果有备注：红色  没有：transparent
        group!.addShape('marker', {
          name: 'remark-marker',
          attrs: {
            x: size[0] + size[2] - 8 + (!((config?.depth as number) % 2) ? -2 : 0), // 宽 - r + 右边展开图标尺寸 - 2
            y: size[4] + (!((config?.depth as number) % 2) ? 2 : 0), // 间距 + 上面内容高度
            r: 8,
            symbol: function (x: any, y: any, r: any) {
              return [['M', x, y], ['L', x + r, y], ['L', x + r, y + r], ['Z']];
            },
            fill: config?.id === this._activeNodeId || config?.remark ? 'red' : 'transparent',
            cursor: 'pointer',
          },
        });

        if ((config!.base as MA_HOME_IBrainMapNode).isDeduction) {
          group!.addShape('rect', {
            attrs: {
              x:
                size[0] +
                size[2] -
                ((config?.depth as number) % 2 ? 36 : 52) -
                ((config?.depth as number) % 2 && (config?.id === this._activeNodeId || config?.remark)
                  ? remarkW + remarkOffset
                  : 0),
              y: size[4] - 8,
              width: 38,
              height: 16,
              fill: '#DC1414',
              radius: 8,
            },
            draggable: true,
          });
          group!.addShape('text', {
            attrs: {
              x:
                size[0] +
                size[2] -
                ((config?.depth as number) % 2 ? 17 : 33) -
                ((config?.depth as number) % 2 && (config?.id === this._activeNodeId || config?.remark)
                  ? remarkW + remarkOffset
                  : 0),
              y: size[4] + 1,
              text: '扣除',
              fill: 'white',
              lineHeight: 17,
              fontSize: 12,
              textAlign: 'center',
              textBaseline: 'middle',
            },
            draggable: true,
          });
        }
        let count = 0;
        (config!.extensions as MA_HOME_INodeExtensionItem[]).forEach((extension) => {
          count += extension.visible ? 1 : 0;
          const label = `${extension.name}：${extension.value ?? '--'}${extension.unit ?? ''}`;
          const width = this.mapLabelWidth(label) + 20;
          const y = size[4] - count * 35;
          group!.addShape('rect', {
            name: `node-extension-${extension.code}-box`,
            visible: extension.visible ?? false,
            attrs: {
              x: size[2],
              y,
              width,
              height: 30,
              fill: extension.color,
              radius: 4,
              opacity: 0.1,
            },
            draggable: true,
          });
          group!.addShape('text', {
            name: `node-extension-${extension.code}-text`,
            visible: extension.visible ?? false,
            attrs: {
              x: size[2] + width / 2,
              y: y + 16,
              text: label,
              fill: extension.color,
              lineHeight: 20,
              fontSize: 14,
              textAlign: 'center',
              textBaseline: 'middle',
            },
            draggable: true,
          });
        });

        return shape;
      },
      getAnchorPoints: () => [
        [0, 0.5],
        [1, 0.5],
      ],
    });

    registerEdge('polyline', {
      draw: (config, group) => {
        const start = config!.startPoint!;
        const end = config!.endPoint!;
        return group!.addShape('path', {
          attrs: {
            stroke: '#C7C7C7',
            path: [
              ['M', start.x, start.y],
              ['L', (start.x + end.x) / 2, start.y],
              ['L', (start.x + end.x) / 2, end.y],
              ['L', end.x, end.y],
            ],
          },
          draggable: true,
        });
      },
      setState: (name, state, item) => {
        switch (name) {
          case 'flow':
            const edge = item?.getContainer().getChildByIndex(0);
            const side = (item as IEdge).getTarget().getModel().side;
            if (state) {
              let offset = 0;
              edge?.toFront();
              edge?.animate(
                () => ({
                  lineWidth: 2,
                  lineDash: [4],
                  lineDashOffset: side === 'left' ? (offset += 0.5) : (offset -= 0.5),
                }),
                { repeat: true, duration: 2333 },
              );
            } else {
              edge?.stopAnimate();
              edge?.attr('lineWidth', 1);
              edge?.attr('lineDash', null);
            }
            break;
          default:
            break;
        }
      },
    });
  }
}
