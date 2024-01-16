import { TreeLayoutConfig, TreeGraph, registerNode, registerEdge, INode, Marker, TreeGraphData, IEdge } from '@antv/g6';
import { Subject } from 'rxjs';
// 类型
import {
  EadIBrainMapNode,
  EadEBrainEdgeState,
  EAD_COLORS_INNER,
  EAD_COLORS_OUTER,
  EAD_NAME_COUNT_GAP,
  EAD_COUNT_UNIT_GAP,
  EAD_COUNT_COLOR_BLACK,
  EAD_COUNT_COLOR_WHITE,
  EAD_NEGATIVE_BG_COLOR,
  EAD_POSITIVE_BG_COLOR,
  EAD_COMPARE_NAME,
  EAD_NODE_PADDING,
  EAD_NODE_LINE_COLOR,
  EAD_NODE_DEFAULT_COLOR,
  EAD_EXPAND_BUTTON_COLOR,
} from './ead-home.api';
// 工具方法
import { mapLabelWidth, mapPaddingWidth } from './ead-home.utils';
import { isMac, thousandSeparation } from '@/utils';
export class EadChartService {
  // g6实例
  private _chart: TreeGraph;
  // 存储每个层级节点数，便于分配颜色
  private _flatCount = new Map<number, number>();
  // 数据
  private _data?: TreeGraphData;
  // 是否可以点击打开弹框
  private _canPopup = false;
  // 缩放比例
  public readonly evZoomChange$ = new Subject<number>();
  /**
   * 初始化
   * @param container
   */
  constructor(container: HTMLDivElement) {
    // 注册节点
    this.register();
    // 初始化
    this._chart = new TreeGraph({
      container,
      modes: {
        default: [
          // 可拖拽
          { type: 'drag-canvas', allowDragOnItem: true },
          // 可缩放
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
        // 宽度
        getWidth: (node: TreeGraphData) => {
          const size = node.size as number[];
          return size[0] + size[2] + size[3];
        },
        // 高度
        getHeight: (node: TreeGraphData) => {
          const size = node.size as number[];
          return size[1] + size[4] * 2;
        },
        getHGap: () => 20,
        getVGap: () => 10,
        getSide: (node: TreeLayoutConfig) => node.data?.side,
      },
    });
    // 添加水印,处理图片宽高以及横向纵向间距
    this._chart.setImageWaterMarker(require('../../../assets/images/common/common-watermark.svg'), {
      width: 170 + 132,
      height: 110 + 206,
      compatible: false,
      image: { y: 110, width: 170, height: 34, rotate: 30 },
    });
    // 注册点击事件，根据节点name处理不同逻辑
    this._chart.on('node:click', (event) => {
      const model = event.item!.getModel() as TreeGraphData;
      switch (event.target.cfg.name) {
        case 'node-box':
        case 'node-text':
        case 'remark-marker':
          if (this._canPopup) {
            // 打开弹框暂时不做，这里留个口子
          }
          break;
        case 'button-toggle':
          // 展开或者收起节点
          model.collapsed = !model.collapsed;
          this._chart.updateItem(event.item!, model);
          this._chart.updateChildren(model.children!, model.id);
          break;
      }
    });
    // 鼠标悬浮
    this._chart.on('node:mouseover', (event) => {
      switch (event.target.cfg.name) {
        case 'node-box':
        case 'node-text':
          // 修改连线状态
          (event.item as INode).getEdges().forEach((edge) => {
            edge.setState('flow', true);
          });
          break;
      }
    });
    // 鼠标离开,修改连线状态
    this._chart.on('node:mouseleave', (event) => {
      (event.item as INode).getEdges().forEach((edge) => edge.setState('flow', false));
    });
    // 鼠标滚轮
    this._chart.on('wheelzoom', () => {
      this.evZoomChange$.next(this._chart.getZoom());
    });
  }
  /**
   * 数据渲染
   * @param data 数据
   * @param canPopup 是否可以打开弹框
   */
  public render(data: EadIBrainMapNode, canPopup: boolean): void {
    this._canPopup = canPopup;
    this._chart.changeData((this._data = this.convert(data)));
    this._chart.fitCenter();
  }
  /**
   * 清除数据&清除画布
   */
  public clear(): void {
    this._data = undefined; // 重置数据，切换查询条件会出现渲染脑图+无数据情况
    this._flatCount.clear();
    this._chart.clear();
  }
  /**
   * 尺寸变化
   * @param width 宽
   * @param height 高
   */
  public resize(width: number, height: number): void {
    this._chart.changeSize(width, height);
    this._chart.fitCenter();
  }
  /**
   * 处理画布缩放，缩放比例必须在最大最小限制范围内
   * @param ratio 缩放比例
   */
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
   *  size[5]: 名称宽度
   *  size[6]: 数值宽度，
   *  size[7]: 单位宽度，
   * @param data 原数据
   * @param deep 层级
   * @param color 颜色
   * @returns
   */
  private convert(data: EadIBrainMapNode, deep = 0, color = EAD_NODE_DEFAULT_COLOR): TreeGraphData {
    // 主节点是否异常--大于0红色，小于0绿色
    const new_color =
      deep === 0
        ? data.amount === null
          ? EAD_NODE_DEFAULT_COLOR
          : Number(data.amount) > 0
          ? EAD_POSITIVE_BG_COLOR
          : EAD_NEGATIVE_BG_COLOR
        : color;
    // 名称文本的宽度
    const name_width = mapLabelWidth(`<span style="line-height: 20px;">${data.nodeName}</span>`);
    // g6绘制的加粗效果与html中的加粗,计算出来的文本宽度有点差距,通过字符长度大概弥补这个差距
    // 值文本的宽度
    const value_width =
      mapLabelWidth(
        `<span style="font-weight: 700;color: rgba(0,0,0,0.85);line-height: 20px;">${
          data.amount !== null ? thousandSeparation(data.amount) : '-'
        }</span>`,
      ) + (isMac() && data.amount !== null ? String(data.amount).length * -1.3 : String(data.amount).length * 0.6);
    // 单位文本的宽度
    const unit_width = mapLabelWidth(`<span style="line-height: 20px;">${data.unit ?? '-'}</span>`);

    const { position, children, ...base } = data;
    return {
      base,
      id: data.nodeId,
      color: new_color,
      unit: data.unit,
      value: data.amount,
      name: data.nodeName,
      side: position,
      collapsed: false,
      size: [
        name_width + value_width + unit_width + EAD_NAME_COUNT_GAP + EAD_COUNT_UNIT_GAP + (deep % 2 ? 0 : 32),
        37,
        ...mapPaddingWidth(deep, position),
        0,
        name_width,
        value_width,
        unit_width,
      ],
      children: children.map((item) => this.convert(item, deep + 1, this.mapColor(deep + 1) ?? color)),
    };
  }
  /**
   * 根据层级获取颜色,根据除4取余结果以及当前层级下的节点数，在颜色组内循环获取颜色
   * EAD_COLORS_INNER、EAD_COLORS_OUTER颜色组由uxd提供
   * @param deep 层级
   * @returns
   */
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
  /**
   * 注册自定义节点,包括注册节点外壳以及节点中各个元素
   * 从config中取size，根据之前计算的宽度、间距对每个元素的大小、位置、字体颜色、填充颜色进行处理
   * 自定义节点中的每个元素都是通过定位的形式渲染上去的
   */
  private register(): void {
    registerNode('rect', {
      draw: (config, group) => {
        const size = config!.size as number[];
        /**
         * 隐藏的组，可以获取文本宽度便于准确计算每个元素的位置
         */
        const hiddenGroup = group?.addGroup({
          id: 'hidden-group',
        });
        // 计算名称文本宽度
        hiddenGroup!.addShape('text', {
          name: 'hidden-name',
          attrs: {
            x: size[2],
            y: size[1] / 2 + 1 + size[4],
            text: config?.name,
            fill: 'transparent',
            opacity: 0,
            lineHeight: 20,
            fontSize: 14,
            textAlign: 'left',
            textBaseline: 'middle',
          },
        });
        const name_rect_w = hiddenGroup?.getBBox()?.width ?? size[5];

        const shape = group!.addShape('rect', {
          attrs: {
            width: size[0] + size[2] + size[3] - size[5] + name_rect_w,
            height: size[1] + size[4] * 2,
            fill: EAD_COUNT_COLOR_WHITE, // 加白色背景，收起时效果会更好
          },
          draggable: true,
        });
        // 外层，
        group!.addShape('rect', {
          name: 'node-box',
          attrs: {
            x: size[2],
            y: size[4],
            width: size[0] - size[5] + name_rect_w,
            height: size[1],
            fill: config?.depth ? 'transparent' : config?.color,
            stroke: (config?.depth as number) % 2 ? 'transparent' : config?.color, // 偶数层级的节点才有边框
            radius: 2,
            cursor: this._canPopup ? 'pointer' : '',
          },
          draggable: true,
        });
        // 将name、value、unit分别作为文本处理，value加粗
        const textGroup = group?.addGroup({
          id: 'text-group',
        });
        const left_pad = (config?.depth as number) % 2 ? 0 : EAD_NODE_PADDING;
        // 节点名称文本
        // x:左外边距+左内边距
        textGroup!.addShape('text', {
          name: 'node-text-name',
          attrs: {
            x: size[2] + left_pad,
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
        // 节点数值
        // x:左外边距+左内边距+名称宽度+文本间距, fill:需要判断是否是根节点或者是需要比较值的节点，判断值正负来判断渲染颜色
        textGroup!.addShape('text', {
          name: 'node-text-value',
          attrs: {
            x: size[2] + left_pad + name_rect_w + EAD_NAME_COUNT_GAP,
            y: size[1] / 2 + 1 + size[4],
            text: config?.value !== null && config?.value !== '' ? thousandSeparation(Number(config?.value)) : '-',
            fill: config?.depth
              ? config?.name === EAD_COMPARE_NAME && config?.value !== null
                ? Number(config?.value) < 0
                  ? EAD_NEGATIVE_BG_COLOR
                  : EAD_POSITIVE_BG_COLOR
                : EAD_COUNT_COLOR_BLACK
              : EAD_COUNT_COLOR_WHITE,
            fontWeight: 700,
            lineHeight: 20,
            fontSize: 14,
            textAlign: 'left',
            textBaseline: 'middle',
            cursor: this._canPopup ? 'pointer' : '',
          },
          draggable: true,
        });
        // 节点单位
        // x:左外边距+左内边距+名称宽度+值宽度+文本间距, fill:需要判断是否是根节点
        textGroup!.addShape('text', {
          name: 'node-text-unit',
          attrs: {
            x: size[2] + left_pad + name_rect_w + EAD_NAME_COUNT_GAP + size[6] + EAD_COUNT_UNIT_GAP,
            y: size[1] / 2 + 1 + size[4],
            text: config?.unit,
            fill: config?.depth ? EAD_COUNT_COLOR_BLACK : EAD_COUNT_COLOR_WHITE,
            color: 'rgba(0, 0, 0, 0.85)',
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
              stroke: EAD_EXPAND_BUTTON_COLOR,
              cursor: 'pointer',
            },
            draggable: true,
          });
        }
        // 偶数层级--在左侧或者右侧添加小圆圈和箭头
        if ((config?.depth as number) % 2) {
          const x = config!.side === 'left' ? size[0] - size[5] + name_rect_w + size[2] + size[3] - 20 : 0;
          group!.addShape('polygon', {
            attrs: {
              points: [
                [x, size[1] / 2 - 5 + size[4]],
                [x, size[1] / 2 + 5 + size[4]],
                [x + 20, size[1] / 2 + size[4]],
              ],
              fill: EAD_NODE_DEFAULT_COLOR,
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
        // 扣除tag
        if ((config!.base as EadIBrainMapNode).deductFlag) {
          // depth为奇数时没有内边距16；扣除tag宽度40：左右内边距8+8，文字宽度24
          // 奇数：40， 偶数：40+16
          const left_rect_x = size[0] - size[5] + name_rect_w + size[2] - ((config?.depth as number) % 2 ? 40 : 56);
          // 奇数：40/2+1， 偶数：40/2+16+1
          const left_text_x = size[0] - size[5] + name_rect_w + size[2] - ((config?.depth as number) % 2 ? 21 : 37);
          // 奇数：0， 偶数：16
          const right_rect_x = size[2] + ((config?.depth as number) % 2 ? 0 : EAD_NODE_PADDING);
          // 奇数：0+19， 偶数：16+19
          const right_text_x = size[2] + ((config?.depth as number) % 2 ? 19 : 35);
          group!.addShape('rect', {
            attrs: {
              x: config?.side === 'left' ? left_rect_x : right_rect_x,
              y: size[4] - 8,
              width: 38,
              height: 16,
              fill: EAD_POSITIVE_BG_COLOR,
              radius: 8,
            },
            draggable: true,
          });
          group!.addShape('text', {
            attrs: {
              x: config?.side === 'left' ? left_text_x : right_text_x,
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
        return shape;
      },
      // 锚点
      getAnchorPoints: () => [
        [0, 0.5],
        [1, 0.5],
      ],
    });
    // 连线
    registerEdge('polyline', {
      /**
       * 绘制连线
       * @param config 配置项
       * @param group 分组
       * @returns
       */
      draw: (config, group) => {
        const start = config!.startPoint!;
        const end = config!.endPoint!;
        return group!.addShape('path', {
          attrs: {
            stroke: EAD_NODE_LINE_COLOR,
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
      /**
       * 更新连线状态
       * @param name
       * @param state
       * @param item
       */
      setState: (name, state, item) => {
        switch (name) {
          case EadEBrainEdgeState.流动效果:
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
        }
      },
    });
  }
}
