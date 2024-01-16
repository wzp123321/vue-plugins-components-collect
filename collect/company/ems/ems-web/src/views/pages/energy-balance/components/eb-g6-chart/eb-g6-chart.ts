import { defineComponent, computed, ref, watch, PropType, onMounted, onUnmounted } from 'vue';
import G6, { TreeGraph, IG6GraphEvent, TreeGraphData, IShape, NodeConfig, EdgeConfig, ComboConfig } from '@antv/g6';
// utils
import nodeStateStyles, { calculateQueryParams } from '../../utils';
import { thousandSeparation, openBlankUrl, getTimeUnitItems } from '@/utils/index';
import useCurrentInstance from '@/utils/use-current-instance';
import { isToday } from 'date-fns';
// service
import energyBalanceService from '@/views/pages/energy-balance/services/energy-balance.service';

/**
 * G6 issues https://github.com/antvis/g6/issues/
 */
export default defineComponent({
  name: 'G6Views',
  props: {
    // 数据源
    dataSource: {
      type: Object as PropType<EnergyBalanceModule.EnergyBalanceInfo>,
      default: {},
    },
    // 方向
    direction: {
      type: Number,
      default: 2,
    },
    // 日
    dailyRatio: {
      type: String,
      default: '30',
    },
    // 总
    totalRatio: {
      type: String,
      default: '5',
    },
    // 查询数据
    queryParams: {
      type: Object as PropType<EnergyBalanceModule.PageFormParams>,
      default: {},
    },
    dailyRatioFlag: {
      type: Boolean,
      default: false,
    },

    differenceFlag: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const { proxy } = useCurrentInstance();
    const collapseIconSize = 30; // 折叠icon尺寸
    const tipIconSize = 28; // 提示icon尺寸
    const tipIconMargin = 1; // 边距
    const filteredLength = ref(0);
    // loading
    const loading = ref(false);
    // 生成id
    const computedChartId = computed(() => {
      return 'balance_charts_' + (Math.random() * 1000).toFixed(0);
    });
    // 是否垂直
    const isVertical = computed(() => {
      return props.direction === 2 ? true : false;
    });
    // 查询参数
    const queryParams = computed(() => {
      return props.queryParams;
    });
    // g6对象
    let graph: TreeGraph;

    /**
     * 初始化g6
     */
    const calculateG6TreeData = () => {
      loading.value = true;
      // 尺寸
      const w = 270 + (isVertical.value ? 0 : collapseIconSize);
      const h = 152 + (isVertical.value ? collapseIconSize : 0);
      // 背景图----需要加载好的图片 否则拖动有img Shape且Text会变化的Node时，img会发生闪烁 ----
      const img = new Image();
      img.src = require('../../../../../assets/img/energy-balance/eb-card-background.svg');
      // 重写展开、收缩图标，增加 +、- 与圆的空隙
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
      /**
       * 注册node节点  自定义节点
       * @params flow-rect 节点名
       * @params options 配置信息
       * @params rect 形状
       */
      G6.registerNode(
        'flow-rect',
        {
          options: {
            size: [270 + (isVertical.value ? 0 : collapseIconSize), 152 + (isVertical.value ? collapseIconSize : 0)],
            stroke: '#91d5ff',
            fill: '#91d5ff',
          },
          // 绘制
          draw(cfg: any, group: any) {
            const {
              treeName,
              dailyGrowth,
              branchValue,
              differenceRatio,
              totalValue,
              collapsed,
              hasChildren,
              unit,
              children,
              limitFlag,
            }: EnergyBalanceModule.EnergyBalanceInfo = cfg;
            const rectConfig = {
              width: w,
              height: h,
              lineWidth: 1,
              fontSize: 12,
              fill: '#fff',
              radius: 4,
              stroke: '#1890FF',
              opacity: 0,
            };
            const textConfig = {
              textAlign: 'left',
              textBaseline: 'top',
              fontFamily: 'PingFangSC-Regular',
            };
            const fontMedium = {
              fontFamily: 'PingFangSC-Medium',
            };
            /**
             * 添加图形 rect 主体内容
             */
            const rect = group.addShape('rect', {
              attrs: {
                ...getRightPosition({ x: 0, y: 0 }, w, h),
                ...rectConfig,
                stroke: '#fff',
                draggable: true,
              },
            });
            /**
             * 添加背景图形 card
             */
            group.addShape('image', {
              attrs: {
                ...getRightPosition({ x: 0, y: 0 }, w, h),
                img,
                width: w - (isVertical.value ? 0 : collapseIconSize),
                height: h - (isVertical.value ? collapseIconSize : 0),
                shadowOffsetX: 0, // 阴影
                shadowOffsetY: 3,
                shadowColor: '#E9F0F6',
                shadowBlur: 10,
                draggable: true,
                cursor: limitFlag ? 'default' : queryParams.value.treeType !== 3 ? 'pointer' : 'default',
              },
              name: 'card',
            });
            // 如果当前node有关联节点 则在节点下添加图形icon
            if (hasChildren) {
              let symbol; // 节点下的展开icon
              if (typeof collapsed === 'undefined') {
                symbol = children && children.length > 0 ? G6.Marker.collapse : G6.Marker.expand;
              } else {
                symbol = !collapsed ? G6.Marker.collapse : G6.Marker.expand;
              }
              /**
               * 添加图形 marker
               */
              group.addShape('marker', {
                attrs: {
                  ...getRightPosition(
                    isVertical.value
                      ? { x: (1 / 2) * w, y: h - (1 / 2) * collapseIconSize }
                      : { x: w - (1 / 2) * collapseIconSize, y: (1 / 2) * h },
                    w,
                    h,
                  ),
                  r: (collapseIconSize - 4) / 2,
                  symbol,
                  stroke: '#1890FF',
                  lineWidth: 2,
                  cursor: limitFlag ? 'default' : 'pointer',
                },
                name: 'collapse-marker',
              });
            }
            const upIcon = {
              symbol: (x: number, y: number, r: number) => [
                ['M', x - r, y + (1 / 3) * r],
                ['L', x + r, y + (1 / 3) * r],
                ['L', x, y - (2 / 3) * r],
                ['Z'],
              ],
            };
            /**
             * 生成提示框，传入的坐标为‘提示框三角形’的顶点坐标
             */
            const generateTooltip = (nodeName: string, tooltip: any, { x, y }: { x: number; y: number }) => {
              // tooltip
              const markerSize = 6;
              const textPadding = [10, 12];
              const fontSize = 14;
              group.addShape('marker', {
                attrs: {
                  ...getRightPosition(
                    {
                      x,
                      y: y + (2 / 3) * markerSize,
                    },
                    w,
                    h,
                  ),
                  r: markerSize,
                  fill: 'rgba(0, 0, 0, 0.85)',
                  symbol: upIcon.symbol,
                  opacity: 0,
                },
                name: `${nodeName}-tooltip-arrow`,
                zIndex: 100, // 提升层级
              });
              // 计算宽度用
              const tooltipText = group.addShape('text', {
                attrs: {
                  ...getRightPosition(
                    {
                      x,
                      y: y + markerSize + textPadding[0],
                    },
                    w,
                    h,
                  ),
                  ...textConfig,
                  fontSize,
                  fill: '#fff',
                  textAlign: 'center',
                  opacity: 0,
                  text: tooltip,
                  cursor: !limitFlag ? 'pointer' : 'default',
                },
                name: `${nodeName}-tooltip-text`,
                zIndex: 101,
              });
              const tooltipBox = tooltipText.getBBox();
              // console.log(tooltipBox);
              group.addShape('rect', {
                attrs: {
                  ...getRightPosition(
                    {
                      x: x - textPadding[1] - tooltipBox.width / 2,
                      y: y + markerSize,
                    },
                    w,
                    h,
                  ),
                  width: Number(tooltipBox.width) + textPadding[1] * 2,
                  height: Number(tooltipBox.height) + textPadding[0] * 2,
                  fill: 'rgba(0, 0, 0, 0.85)',
                  radius: 4,
                  opacity: 0,
                  cursor: !limitFlag ? 'pointer' : 'default',
                },
                name: `${nodeName}-tooltip-rect`,
                zIndex: 99,
              });
            };

            // 节点名称
            const titleBBox = group.addShape('text', {
              attrs: {
                ...textConfig,
                ...fontMedium,
                ...getRightPosition({ x: 16, y: 11 }, w, h),
                // lineHeight: 24
                // height: 24,
                text: `${treeName.length <= 10 ? treeName : treeName.substr(0, 9) + '...'}`,
                fontSize: 16,
                fill: 'rgba(0, 0, 0, 0.85)',
                cursor: !limitFlag ? 'pointer' : 'default',
              },
              name: 'text-title',
            });
            if (treeName.length > 10) {
              generateTooltip('text-title', treeName, {
                x: 16 + titleBBox.getBBox().width / 2,
                y: 11 + titleBBox.getBBox().height,
              });
            }
            /**
             * 右上角提示图标
             * 负 - icon
             */
            const icons = [];
            if (differenceRatio < 0 || (hasChildren && differenceRatio === 0 && branchValue > totalValue)) {
              // 2024-01-03 能流平衡配置别名，根据模式关闭差值展示
              if (props.differenceFlag) {
                icons.push({
                  name: '负',
                  fill: 'rgba(245, 34, 45)',
                  nodeName: 'icon-negative',
                  tooltip: '节点能耗总值低于下级节点能耗值之和',
                });
              }
            }
            // 标记是否满足筛选条件
            let hasIcons = false;
            // 取绝对值比较，如果没填则与5比较
            if (
              Math.abs(differenceRatio) >
              (props.totalRatio !== '' && props.totalRatio !== null ? Number(props.totalRatio) : 5)
            ) {
              // 2024-01-03 能流平衡配置别名，根据模式关闭差值展示
              if (props.differenceFlag) {
                icons.push({
                  name: '差',
                  fill: 'rgba(250, 173, 20)',
                  nodeName: 'icon-difference',
                  tooltip: `节点能耗总值相对下级节点能耗总值之和的差值大于${
                    props.totalRatio !== '' && props.totalRatio !== null ? Number(props.totalRatio) : 5
                  }%`,
                });
                hasIcons = true;
              }
            }
            // 如果没填则与30比较
            if (dailyGrowth > (props.dailyRatio !== '' && props.dailyRatio !== null ? Number(props.dailyRatio) : 30)) {
              icons.push({
                name: '增',
                fill: 'rgba(250, 140, 22)',
                nodeName: 'icon-increase',
                tooltip: `节点能耗相对昨日增长超过${
                  props.dailyRatio !== '' && props.dailyRatio !== null ? Number(props.dailyRatio) : 30
                }%`,
              });
              hasIcons = true;
            }
            if (dailyGrowth < -(Number(props.dailyRatio) || 30)) {
              icons.push({
                name: '减',
                fill: 'rgba(250, 84, 28)',
                nodeName: 'icon-decrease',
                tooltip: `节点能耗相对昨日减少超过${Number(props.dailyRatio) || 30}%`,
              });
              hasIcons = true;
            }
            // 点查询的时候，这个逻辑用不到，有一丢丢浪费...
            if (hasIcons) {
              filteredLength.value++;
            }
            if (limitFlag) {
              icons.push({
                name: '限',
                fill: 'rgba(0, 0, 0, 0.15)',
                nodeName: 'icon-unauthorized',
                tooltip: '无节点查询权限',
              });
            }
            // 遍历icons
            icons.forEach((icon, index) => {
              const position = {
                x:
                  w -
                  (index + 1) * (tipIconSize + tipIconMargin) +
                  tipIconMargin -
                  (isVertical.value ? 0 : collapseIconSize),
                y: 0,
              };
              group.addShape('rect', {
                attrs: {
                  ...getRightPosition(position, w, h),
                  width: tipIconSize,
                  height: tipIconSize,
                  radius: index === 0 ? [2, 8, 2, 2] : 2,
                  fill: icon.fill,
                  cursor: limitFlag ? 'default' : 'pointer',
                },
                name: `${icon.nodeName}-bg`,
              });
              group.addShape('text', {
                attrs: {
                  ...getRightPosition(
                    {
                      x: position.x + 7,
                      y: position.y + 7,
                    },
                    w,
                    h,
                  ),
                  ...textConfig,
                  width: tipIconSize,
                  height: tipIconSize,
                  fontSize: 14,
                  text: icon.name,
                  fill: '#fff',
                  shadowOffsetX: 0, // 阴影
                  shadowOffsetY: 2,
                  shadowColor: 'rgba(0, 0, 0, 0.2)',
                  shadowBlur: 4,
                  cursor: limitFlag ? 'default' : 'pointer',
                },
                name: `${icon.nodeName}`,
              });

              generateTooltip(icon.nodeName, icon.tooltip, {
                x: position.x + tipIconSize / 2,
                y: position.y + tipIconSize + 2,
              });
            });

            let top = 0;
            if (!hasChildren) {
              top = 23;
            }
            const subTitle = {
              fontSize: 12,
              fill: 'rgba(0, 0, 0, 0.65)',
            };
            const value = {
              fontSize: 20,
              fill: 'rgba(0, 100, 255, 100)',
              ...fontMedium,
            };
            const textBackground = {
              height: 18,
              fill: 'rgba(0, 0, 0, 0.04)',
              radius: 9,
            };
            const text = {
              ...textConfig,
              fontSize: 12,
              fill: 'rgba(0, 0, 0, 0.65)',
            };
            const keyText = {
              ...text,
              width: 37,
              fill: 'rgba(0, 0, 0, 0.85)',
              // textAlign: 'right',
              ...fontMedium,
            };

            // 主体部分
            // tslint:disable-next-line:cyclomatic-complexity
            const drawBody = (
              distance: number,
              {
                order,
                title,
                num,
                markShow = true,
                mark,
                markValue,
                hasIcon,
                rectName,
                rectWidth,
              }: GlobalModule.CommonObject,
            ) => {
              // 总（kWh）
              if (title.indexOf('<sup>') === -1) {
                group.addShape('text', {
                  attrs: {
                    ...textConfig,
                    ...getRightPosition({ x: 16, y: top + distance + 44 }, w, h),
                    text: title,
                    ...subTitle,
                  },
                });
              } else {
                // 处理上标
                const x = title.split('<sup>');
                const y = x[1].split('</sup>');
                const arrText = [];
                arrText[0] = x[0];
                arrText.push(...y);

                const attrs = {
                  ...textConfig,
                  ...getRightPosition({ x: 16, y: top + distance + 44 }, w, h),
                  ...subTitle,
                };
                const normalText1 = group.addShape('text', {
                  attrs: {
                    ...attrs,
                    text: arrText[0],
                  },
                });
                const supText = group.addShape('text', {
                  attrs: {
                    ...attrs,
                    x: attrs.x + normalText1.getBBox().width,
                    y: attrs.y,
                    fontSize: attrs.fontSize / 1.5,
                    text: arrText[1],
                  },
                });
                group.addShape('text', {
                  attrs: {
                    ...attrs,
                    x: attrs.x + normalText1.getBBox().width + supText.getBBox().width,
                    text: arrText[2],
                  },
                });
              }

              const formattedNum = thousandSeparation(num);
              // 总值
              const numBBox = group.addShape('text', {
                attrs: {
                  ...textConfig,
                  ...getRightPosition({ x: 16, y: top + distance + 64 }, w, h),
                  text: `${formattedNum.length <= 10 ? formattedNum : formattedNum.substr(0, 8) + '...'}`,
                  ...value,
                  cursor: !limitFlag || formattedNum.length > 10 ? 'pointer' : 'default',
                },
                name: `text-value${order}`,
              });
              if (formattedNum.length > 10) {
                generateTooltip(`text-value${order}`, formattedNum, {
                  x: 16 + numBBox.getBBox().width / 2,
                  y: top + distance + 64 + numBBox.getBBox().height,
                });
              }

              // 较昨日、差值 背景
              if (markShow) {
                const responseRect = group.addShape('rect', {
                  attrs: {
                    ...getRightPosition({ x: 135, y: top + distance + 64 }, w, h),
                    ...textBackground,
                    width: rectWidth,
                  },
                  name: `${rectName}`,
                });
                group.addShape('text', {
                  attrs: {
                    ...text,
                    ...getRightPosition({ x: 145, y: top + distance + 68 }, w, h),
                    text: mark,
                  },
                });
                /**
                 * ↑ = ↓ 图标 如果数据为null时也展示equal
                 */
                if (hasIcon) {
                  group.addShape('image', {
                    attrs: {
                      ...getRightPosition({ x: 189, y: top + distance + 67 }, w, h),
                      img: require(`../../../../../assets/img/energy-balance/eb-compare-${
                        markValue > 0 ? 'up' : markValue < 0 ? 'down' : 'equal'
                      }.png`),
                      width: 12,
                      height: 12,
                    },
                  });
                }
                const formattedMarkValue = markValue === '--' ? '--' : thousandSeparation(markValue);
                const responseText = group.addShape('text', {
                  attrs: {
                    ...keyText,
                    ...getRightPosition({ x: hasIcon ? 207 : 177, y: top + distance + 68 }, w, h),
                    text: `${
                      formattedMarkValue.length <= (hasIcon ? 5 : 8)
                        ? formattedMarkValue
                        : formattedMarkValue.substr(0, hasIcon ? 3 : 6) + '...'
                    }${formattedMarkValue === '--' ? '' : '%'}`,
                    cursor: limitFlag || formattedMarkValue.length <= (hasIcon ? 5 : 8) ? 'default' : 'pointer',
                  },
                  name: `text-mark${order}`,
                });
                // 提示框
                const textBBox = responseText.getBBox();
                if (formattedMarkValue.length > (hasIcon ? 5 : 8)) {
                  generateTooltip(`text-mark${order}`, `${formattedMarkValue}%`, {
                    x: (hasIcon ? 207 : 177) + textBBox.width / 2,
                    y: top + distance + 68 + textBBox.height,
                  });
                }
                // 灰色背景自适应
                // console.log(textBBox);
                responseRect.attr({
                  width: Math.min(textBBox.width + (hasIcon ? 72 : 42) + 10, rectWidth),
                });
              }
            };
            /**
             * 较昨日  如果跨日 则不展示
             */
            drawBody(0, {
              order: 1,
              rectName: 'response-rect-1',
              title: `总（${unit}）`,
              num: totalValue,
              markShow: props.dailyRatioFlag,
              mark: '较昨日',
              markValue: totalValue === 0 && branchValue !== 0 ? '--' : dailyGrowth,
              hasIcon: true,
              rectWidth: 119,
            });

            // 如果有关联
            if (hasChildren) {
              drawBody(57, {
                order: 2,
                rectName: 'response-rect-2',
                title: `分（${unit}）`,
                num: branchValue,
                // 2024-01-03 能流平衡配置别名，根据模式关闭差值展示
                markShow: props.differenceFlag,
                mark: '差值',
                markValue: differenceRatio,
                hasIcon: false,
                rectWidth: 119,
              });
            }
            // 重新排序
            group.sort();
            return rect;
          },
          update(cfg: any, item: any) {
            const group = item.getContainer();
            // G6.updateLinkPoints(cfg, group);
          },
        },
        'rect',
      );
      /**
       * 注册tooltip行为
       */
      G6.registerBehavior('tooltipToggle', {
        getEvents() {
          return {
            ...nodeStateStyles.iconEvents,
            ...nodeStateStyles.textEvents,
            mouseover: 'nodeMouseover',
          };
        },
        onMouseover: (e: any) => {
          const item = e.item;
          item.toFront();
          graph.setItemState(item, `mouseover:${e.name.split(':')[0].split('-')[1]}`, true);
        },
        onMouseout: (e: any) => {
          const item = e.item;
          graph.setItemState(item, `mouseover:${e.name.split(':')[0].split('-')[1]}`, false);
        },
        nodeMouseover(e: any) {
          const item = e.item;
          if (item) {
            item.toFront();
          }
        },
      });
      initG6Chart();
    };
    /**
     * 初始化G6
     * graph.data(initData); // 加载数据
     * graph.render(); // 渲染
     * fitView：设置是否将图适配到画布中；
     * fitViewPadding：画布上四周的留白宽度。
     */
    const initG6Chart = () => {
      // 如果存在图纸 需要销毁在初始化
      if (graph && !graph.destroyed) {
        graph.destroy();
      }
      let width = 0;
      let height = 0;
      if (
        document.getElementsByClassName('energy-balance__chart') &&
        document.getElementsByClassName('energy-balance__chart').length
      ) {
        // 容器宽度
        width = (document.getElementsByClassName('energy-balance__chart')[0] as Element).clientWidth - 10;
        // 容器高度
        height = (document.getElementsByClassName('energy-balance__chart')[0] as Element).clientHeight - 15;
      }
      if (!document.getElementById(computedChartId.value)) {
        return;
      }
      try {
        graph = new G6.TreeGraph({
          container: computedChartId.value, // 指定挂载容器
          width,
          height,
          animate: false, // 闭动画
          fitView: true, // 适应容器
          fitViewPadding: [20],
          minZoom: 0.5,
          maxZoom: 2, // 放大视图
          modes: {
            default: ['drag-canvas', 'zoom-canvas', 'tooltipToggle'],
          },
          // 默认节点
          defaultNode: {
            type: 'flow-rect',
          },
          // 默认连线
          defaultEdge: {
            type: 'cubic-' + (isVertical.value ? 'vertical' : 'horizontal'),
            style: {
              stroke: '#979797',
              lineWidth: 1,
            },
          },
          // 不同状态下节点样式
          nodeStateStyles: {
            ...nodeStateStyles.iconStateStyles,
            ...nodeStateStyles.textStateStyles,
          },
          // 布局
          layout: {
            type: 'compactBox',
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
        });
        // 读取数据
        graph.read(props.dataSource);
        // 绘制
        graph.render();
        // v3.5.1 后支持。平移图到中心将对齐到画布中心，但不缩放。优先级低于 fitView。
        graph.fitCenter();
        /**
         * 注册事件
         * 展开收起icon按钮点击事件
         */
        graph.on('collapse-marker:click', async (e: IG6GraphEvent) => {
          const item = e.item;
          const cardData = item && item.getModel();
          if (!cardData) {
            return;
          }
          if (typeof cardData.collapsed === 'undefined') {
            cardData.collapsed = true;
          }
          const icon = e.shape;
          if (cardData.collapsed && (!(cardData as any).children || (cardData as any).children.length === 0)) {
            const { treeId } = cardData;
            const params = calculateQueryParams(queryParams.value);
            try {
              const res = await energyBalanceService.queryEnergyBalanceData({
                ...params,
                treeId: Number(treeId),
              });
              loading.value = true;
              if (!e.target.destroyed) {
                if (res && res.code === 200 && res.data) {
                  res.data.children = res.data.children.map((item: any) => {
                    return { ...item, ...{ collapsed: true } };
                  });
                  cardData.children = res.data.children || [];
                  changeIcon(item, cardData, icon);
                  changeIcon(item, cardData, icon);
                  changeIcon(item, cardData, icon);
                  loading.value = false;
                } else {
                  loading.value = false;
                  proxy.$message.error(res.message || '获取数据失败');
                }
              }
            } catch (error) {
              proxy.$message.error('获取数据失败');
            }
          } else {
            changeIcon(item, cardData, icon);
          }
        });
        /**
         * 点击图片，跳转页面
         * 无法跳转：支路树、限
         */
        graph.on('card:click', async (e: IG6GraphEvent) => {
          const cardData = e.item && e.item.getModel();
          // 支路树不能跳转
          if (cardData && queryParams.value.treeType !== 3 && !cardData?.limitFlag) {
            const { treeId } = cardData;
            const { treeType, energyCode, date } = props.queryParams;
            const timeUnit = await getTimeUnit(date);
            if (isToday(date[1])) {
              date[1] = new Date();
            } else {
              date[1].setHours(23);
              date[1].setMinutes(59);
            }
            /**
             * toDo 怎么取颗粒度
             */
            window.sessionStorage.setItem(
              'ems-analysis-query-params',
              JSON.stringify({
                treeType,
                energyCode,
                date,
                timeUnit,
                treeId,
              }),
            );
            openBlankUrl('/web/energyAnalysis');
          }
        });
        loading.value = false;
      } catch (error) {
        loading.value = false;
        console.log('图纸初始化失败！', error);
      } finally {
        loading.value = false;
      }
    };
    /**
     * 更新 ＋、－ 符号
     * @param item item
     * @param cardData 数据
     * @param icon 加减符号对象
     */
    const changeIcon = (item: any, cardData: NodeConfig | EdgeConfig | ComboConfig | TreeGraphData, icon: IShape) => {
      if (cardData.collapsed) {
        icon.attr('symbol', G6.Marker.collapse);
      } else {
        icon.attr('symbol', G6.Marker.expand);
      }
      cardData.collapsed = !cardData.collapsed;
      graph.layout();

      // 防止收缩节点后，视口不存在节点而报错(g6 bug，目前还未修复 2020-10-26 14:32:49）
      // 聚焦节点，添加动画 item	string / Object	元素 ID 或元素实例 animatedly move the graph to focus on the item.
      // the second parameter controls whether move with animation, the third parameter is the animate configuration
      graph.focusItem(item, false);

      // 必须手动修改 originStyle。因为 setState 为 false 的时候（即触发 xxx:mouseout 事件后），会重置样式为 originStyle。
      // 但是直接 attr 修改 collapse-marker 的 symbol 属性，originStyle 中的 symbol 仍然没变。
      // 将导致触发 xxx:mouseout 后的符号始终为 expand
      const style = item.getOriginStyle()['collapse-marker'];
      if (style) {
        style.symbol = icon.attr('symbol');
        item.setOriginStyle(style);
      }
    };
    /**
     * 处理定位
     */
    const getRightPosition = ({ x, y }: { x: number; y: number }, w: number, h: number) => {
      return {
        x: x - w / 2,
        y: y - h / 2,
      };
    };
    /**
     * 过滤
     */
    const onFilter = () => {
      if (graph && !graph.destroyed) {
        graph.destroy();
      }
      if (props.dataSource) {
        filteredLength.value = 0;
        calculateG6TreeData();
        if (filteredLength.value === 0) {
          proxy.$message.warning('未筛选到符合条件的节点');
        } else {
          proxy.$message.success('筛选完成，请根据节点角标查看结果');
        }
      }
    };
    /**
     * 监听方向变化
     */
    watch(
      () => props.direction,
      (newVal: number) => {
        if (newVal) {
          calculateG6TreeData();
        }
      },
    );
    /**
     * 监听数据源变化
     */
    watch(
      () => props.dataSource,
      (newVal) => {
        if (newVal && Object.keys(newVal).length) {
          calculateG6TreeData();
        }
      },
      {
        immediate: true,
      },
    );
    const onResize = () => {
      /**
       * 改变画布大小
       */
      if (graph && !graph.destroyed && document.getElementById(computedChartId.value)) {
        let w = 0;
        let h = 0;
        if (document.getElementById(computedChartId.value)) {
          w = (document.getElementById(computedChartId.value) as Element).clientWidth - 10;
          h = (document.getElementById(computedChartId.value) as Element).clientHeight - 15;
        }
        graph.changeSize(w, h);
      }
    };
    // 获取时间颗粒度
    const getTimeUnit = async (date: any) => {
      const timeUnits = await getTimeUnitItems(new Date(date[0]), new Date(date[1]));

      return timeUnits?.length ? timeUnits[0].value : '';
    };
    /**
     * 初始化
     */
    onMounted(() => {
      window.addEventListener('resize', onResize);
    });
    /**
     * 销毁前
     */
    onUnmounted(() => {
      window.removeEventListener('resize', onResize);
    });

    return {
      computedChartId,
      loading,
      onFilter,
    };
  },
});
