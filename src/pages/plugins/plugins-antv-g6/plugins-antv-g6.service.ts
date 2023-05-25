import { TreeLayoutConfig, TreeGraph, registerNode, registerEdge, INode, Marker, TreeGraphData, IEdge } from '@antv/g6';
import { Subject } from 'rxjs';
import {
  EAD_HOME_IBrainMapNode,
  EAD_HOME_INodeExtensionItem,
  EAD_COLORS_INNER,
  EAD_COLORS_OUTER,
  EAD_NAME_COUNT_GAP,
  EAD_COUNT_UNIT_GAP,
  EAD_COUNT_COLOR,
  EAD_OVER_BG_COLOR,
} from './plugins-antv-g6.api';
import { mapLabelWidth } from './plugins-antv-g6.utils';

export class EadChartService {
  private _chart: TreeGraph;
  private _flatCount = new Map<number, number>();
  private _data?: TreeGraphData;
  private _canPopup = false;

  public readonly evZoomChange$ = new Subject<number>();

  constructor(container: HTMLDivElement) {
    // 注册节点
    this.register();
    // 初始化
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

    // 水印
    this._chart.setImageWaterMarker(require('../../../assets/images/g6/g6-watermark.svg'), {
      width: 170 + 132,
      height: 110 + 206,
      compatible: false,
      image: { y: 110, width: 170, height: 34, rotate: 30 },
    });

    this._chart.on('node:click', (event) => {
      const model = event.item!.getModel() as TreeGraphData;
      switch (event.target.cfg.name) {
        case 'node-box':
        case 'node-text':
        case 'remark-marker':
          if (this._canPopup) {
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
    });
    this._chart.on('node:mouseleave', (event) => {
      (event.item as INode).getEdges().forEach((edge) => edge.setState('flow', false));
    });
    this._chart.on('wheelzoom', () => {
      this.evZoomChange$.next(this._chart.getZoom());
    });
  }

  public render(data: EAD_HOME_IBrainMapNode, canPopup: boolean): void {
    this._canPopup = canPopup;
    this._chart.changeData((this._data = this.convert(data)));
    this._chart.fitCenter();
  }

  public clear(): void {
    this._data = undefined; // 重置数据，切换查询条件会出现渲染脑图+无数据情况
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
  }

  public operate(codes: readonly string[], base: EAD_HOME_INodeExtensionItem[]): void {
    if (!this._data) {
      return;
    }

    const check = (model: TreeGraphData): void => {
      const extensions = model.extensions as EAD_HOME_INodeExtensionItem[];
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

  /**
   * 数据转换
   * size:
   *  size[0]:文本宽度+如果有边框则加上左右边距16*2
   *  size[1]:高度
   *  size[2]:内容区域距左边距离
   *          中间节点为0，
   *          position为right：deep为奇数时为45（三角宽度20+三角圆球间距5+圆球宽度10+圆球内容间距10），deep为偶数时为0
   *          position为left：deep为奇数时为26（展开图标宽度16+图标内容间距10），deep为偶数时为45（三角宽度20+三角圆球间距5+圆球宽度10+圆球内容间距10）
   *  size[3]:内容区域距右边距离
   *          中间节点为0，
   *          position为right：deep为奇数时为26（展开图标宽度16+图标内容间距10），deep为偶数时为26（展开图标宽度16+图标内容间距10）
   *          position为left：deep为奇数时为45（三角宽度20+三角圆球间距5+圆球宽度10+圆球内容间距10），deep为偶数时为26（展开图标宽度16+图标内容间距10）
   *  size[4]: 0，
   * @param data 原数据
   * @param deep 层级
   * @param color 颜色
   * @returns
   */
  private convert(data: EAD_HOME_IBrainMapNode, deep = 0, color = '#128BED'): TreeGraphData {
    // 主节点是否异常
    const newColor = deep === 0 ? (Number(data.value) > 0 ? '#128BED' : EAD_OVER_BG_COLOR) : '#128BED';
    const label = `<span>${data.name}<span style="padding: 0 4px 0 8px;font-weight: 700;color: rgba(0,0,0,0.85)">
    ${data.value ?? '--'}</span><span style="color: rgba(0,0,0,0.85)">${data.unit ?? ''}</span></span>`;
    const { position, extensions, children, operateName, ...base } = data;
    return {
      base,
      id: data.id,
      color: newColor,
      operateName,
      label,
      unit: data.unit,
      value: data.value,
      name: data.name,
      side: position,
      collapsed: false,
      size: [mapLabelWidth(label) + (deep % 2 ? 0 : 32), 37, ...this.mapPaddingWidth(deep, position), 0],
      extensions,
      children: children.map((item) => this.convert(item, deep + 1, this.mapColor(deep + 1) ?? color)),
    };
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
        return EAD_COLORS_INNER[count % EAD_COLORS_INNER.length];
      case 3:
        return EAD_COLORS_OUTER[count % EAD_COLORS_OUTER.length];
      default:
        break;
    }
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
        // 外层
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

        // 将name、value、unit分别作为文本处理，value加粗
        const textGroup = group?.addGroup({
          id: 'text-group',
        });
        const leftPad = (size[0] - mapLabelWidth(config?.label + '')) / 2;
        const valueLabel = `<span style="font-weight: 700">${config?.value}</span>`;
        textGroup!.addShape('text', {
          name: 'node-text-name',
          attrs: {
            x: size[2] + leftPad,
            y: size[1] / 2 + 1 + size[4],
            text: config?.name,
            fill: config?.depth ? 'rgba(0, 0, 0, 0.65)' : 'white',
            lineHeight: 20,
            fontSize: 14,
            textAlign: 'left',
            textBaseline: 'middle',
            cursor: this._canPopup ? 'pointer' : '',
          },
          draggable: true,
        });
        textGroup!.addShape('text', {
          name: 'node-text-value',
          attrs: {
            x: size[2] + leftPad + mapLabelWidth(config?.name + '') + EAD_NAME_COUNT_GAP,
            y: size[1] / 2 + 1 + size[4],
            text: config?.value,
            fill: config?.depth ? EAD_COUNT_COLOR : 'white',
            fontWeight: 700,
            lineHeight: 20,
            fontSize: 14,
            textAlign: 'left',
            textBaseline: 'middle',
            cursor: this._canPopup ? 'pointer' : '',
          },
          draggable: true,
        });
        textGroup!.addShape('text', {
          name: 'node-text-unit',
          attrs: {
            x:
              size[2] +
              leftPad +
              mapLabelWidth(config?.name + '') +
              EAD_NAME_COUNT_GAP +
              mapLabelWidth(valueLabel) +
              EAD_COUNT_UNIT_GAP,
            y: size[1] / 2 + 1 + size[4],
            text: config?.unit,
            fill: config?.depth ? EAD_COUNT_COLOR : 'white',
            lineHeight: 20,
            fontSize: 14,
            textAlign: 'left',
            textBaseline: 'middle',
            cursor: this._canPopup ? 'pointer' : '',
          },
          draggable: true,
        });

        // 如果有子节点，判断是否处于展开状态
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
        // 偶数层级--在左侧或者右侧添加小圆圈和箭头
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

        if ((config!.base as EAD_HOME_IBrainMapNode).isDeduction) {
          group!.addShape('rect', {
            attrs: {
              x: size[0] + size[2] - ((config?.depth as number) % 2 ? 36 : 52),
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
              x: size[0] + size[2] - ((config?.depth as number) % 2 ? 17 : 33),
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
        (config!.extensions as EAD_HOME_INodeExtensionItem[]).forEach((extension) => {
          count += extension.visible ? 1 : 0;
          const label = `${extension.name}：${extension.value ?? '--'}${extension.unit ?? ''}`;
          const width = mapLabelWidth(label) + 20;
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
