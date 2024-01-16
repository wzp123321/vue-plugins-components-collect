/*
 * @Description: 能源事件库详情弹框
 * @Autor: kongx
 * @Date: 2022-05-12 10:53:11
 * @LastEditors: wanzp wanzp@tiansu-china.com
 * @LastEditTime: 2023-12-06 11:43:16
 */
import { defineComponent, ref, onMounted, nextTick, watch } from 'vue';
import { Chart, registerTheme, registerShape, registerInteraction } from '@antv/g2';
import { cloneDeep } from 'lodash';
import { TabObj } from '../../constant/options';
export default defineComponent({
  name: 'MhmEnergyTotalEcharts',
  emits: ['changeComponents', 'back'],
  props: ['dialogTitle', 'showComponentId', 'treeList', 'loadingStatus', 'chartList'],
  setup(props, ctx) {
    const colorList = ref<string[]>([
      '#4BB0FF',
      '#FF9120',
      '#FFCB20',
      '#C2E17A',
      '#00B261',
      '#443AFF',
      '#A83BFF',
      '#A83BFF',
      '#00A5B2',
      '#8284FF',
      '#2FD3DC',
    ]);
    const treeListCopy = ref<TabObj[]>([]);
    let chart: typeof Chart;
    watch(
      () => props.treeList,
      (val) => {
        treeListCopy.value = cloneDeep(val);
        mapTreeList();
      },
      {
        deep: true,
      },
    );
    watch(
      () => props.chartList,
      (val) => {
        g2Render();
      },
      {
        deep: true,
      },
    );
    const back = () => {
      chart.destroy();
      ctx.emit('back');
    };
    const openDetail = () => {
      chart.destroy();
      ctx.emit('changeComponents', treeListCopy.value[1].name);
    };
    const mapTreeList = () => {
      let indexMiddle: number;
      if (treeListCopy.value.length % 2 === 1) {
        indexMiddle = Math.floor(treeListCopy.value.length / 2);
      } else {
        indexMiddle = treeListCopy.value.length / 2;
      }
      treeListCopy.value.forEach((item: any, index: number) => {
        item.color = colorList.value[index + 1];
        if (index < indexMiddle) {
          item.siteMargin = 'margin-bottom:32px';
          item.site = 'top';
        } else if (index === indexMiddle) {
          item.site = 'middle';
        } else {
          item.siteMargin = 'margin-top:32px';
          item.site = 'bottom';
        }
      });
    };
    const g2Render = () => {
      const data = cloneDeep(props.chartList);
      if (typeof data === undefined || data.length === 0) return;
      registerTheme('newTheme', { maxColumnWidth: 10 });
      chart = new Chart({
        container: 'container',
        autoFit: true,
      });
      chart.data(data);
      chart.scale({
        rate: { sync: 'value', nice: true },
        value: { sync: true, nice: true },
      });
      chart.axis('date', {
        tickLine: null,
        line: {
          style: {
            stroke: '#dadada',
          },
        },
        label: {
          offset: 8,
          style: {
            fill: 'rgba(0, 0, 0, 0.65)',
            lineHeight: 22,
            color: 'rgba(0, 0, 0, 0.65)',
            fontSize: 14,
          },
        },
      });
      chart.axis('value', {
        label: {
          offset: 8,
          style: {
            fill: 'rgba(0, 0, 0, 0.65)',
            lineHeight: 22,
            color: 'rgba(0, 0, 0, 0.65)',
            fontSize: 14,
          },
          formatter: (text: any) => {
            return text.replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
          },
        },
        title: {
          position: 'end',
          text: '元',
          autoRotate: false,
          offset: 10,
          style: {
            fill: 'rgba(0, 0, 0, 0.65)',
            lineHeight: 22,
            color: 'rgba(0, 0, 0, 0.65)',
            textAlign: 'end',
            fontSize: 14,
            y: 15,
          },
        },
        position: 'left',
        line: {
          style: {
            fill: '#dadada',
            color: '#dadada',
            width: 1,
            stroke: '#dadada',
            opacity: 0.4,
          },
        },
      });
      chart.axis('rate', false);
      chart.legend({
        position: 'top',
        itemName: {
          style: (item: any, index: any, items: any) => {
            return {
              fontSize: 14,
              fill: item.marker.style.fill,
              color: item.marker.style.fill,
            };
          },
        },
        marker: (item: any, index: any, items: any) => {
          return {
            symbol: () =>
              index
                ? [['M', -4, 1], ['L', 6, 1], ['L', 6, 11], ['L', -4, 11], ['Z']]
                : [
                    ['M', -13, 6],
                    ['L', 7, 6],
                  ],
            style: {
              fill: items.style.fill,
              stroke: items.style.fill,
              lineWidth: 1,
              radius: 1,
            },
          };
        },
      });
      const actualList = data.filter((item: any) => {
        return item.type === props.dialogTitle;
      });
      /**
       * 是否显示点
       */
      registerShape('point', 'breath-point', {
        draw(cfg: any, container: any) {
          const data: any = cfg.data;
          const point = { x: cfg.x, y: cfg.y };
          const group = container.addGroup();
          if (data.type === props.dialogTitle && actualList && actualList.length > 0) {
            if (
              data.index === 0 &&
              data.rate !== null &&
              ((actualList.length > 1 && actualList[1]?.rate === null) || actualList.length === 1)
            ) {
              group.addShape('circle', {
                attrs: {
                  x: +point.x,
                  y: +point.y,
                  r: 6,
                  fill: '#fff',
                  opacity: 1,
                  lineWidth: 1,
                  shadowOffsetY: 4,
                  stroke: 'rgba(0, 0, 0, 0.1)',
                },
              });
              group.addShape('circle', {
                attrs: {
                  x: +point.x,
                  y: +point.y,
                  r: 3,
                  fill: '#4BB0FF',
                  opacity: 1,
                  zIndex: 10,
                },
              });
            } else if (
              data.rate !== null &&
              actualList.length > 1 &&
              data.index === actualList.length - 1 &&
              actualList[actualList.length - 2]?.rate === null
            ) {
              group.addShape('circle', {
                attrs: {
                  x: +point.x,
                  y: +point.y,
                  r: 6,
                  fill: '#fff',
                  opacity: 1,
                  lineWidth: 1,
                  shadowOffsetY: 4,
                  stroke: 'rgba(0, 0, 0, 0.1)',
                  linewidth: 1,
                },
              });
              group.addShape('circle', {
                attrs: {
                  x: +point.x,
                  y: +point.y,
                  r: 3,
                  fill: '#4BB0FF',
                  opacity: 1,
                  zIndex: 10,
                },
              });
            } else if (
              data.rate !== null &&
              actualList[data.index - 1]?.rate === null &&
              actualList[data.index + 1]?.rate === null
            ) {
              group.addShape('circle', {
                attrs: {
                  x: +point.x,
                  y: +point.y,
                  r: 6,
                  fill: '#fff',
                  opacity: 1,
                  stroke: 'rgba(0, 0, 0, 0.1)',
                  linewidth: 1,
                },
              });
              group.addShape('circle', {
                attrs: {
                  x: +point.x,
                  y: +point.y,
                  r: 3,
                  fill: '#4BB0FF',
                  opacity: 1,
                  zIndex: 10,
                },
              });
            } else {
              group.addShape('circle', {
                attrs: {
                  x: +point.x,
                  y: +point.y,
                  r: 0,
                  fill: 'transparent',
                  opacity: 0,
                  zIndex: 10,
                  stroke: 'transparent',
                  linewidth: 0,
                },
              });

              group.addShape('circle', {
                attrs: {
                  x: +point.x,
                  y: +point.y,
                  r: 0,
                  fill: 'transparent',
                  opacity: 0,
                  zIndex: 10,
                },
              });
            }
          }

          return group;
        },
      });
      chart.tooltip({
        shared: true,
        showMarkers: true,
        showCrosshairs: false,
        crosshairs: {
          type: 'x',
          follow: true,
          line: {
            style: {
              lineWidth: 0.5,
              // fill: ' rgba(0, 0, 0, 0.5);',
              color: {
                type: 'linear',
                colorStops: [
                  {
                    offset: 1,
                    color: 'rgba(0, 178, 97, 1)', // 0% 处的颜色
                  },
                  {
                    offset: 0,
                    color: 'rgba(255, 255, 255, 1)', // 100% 处的颜色
                  },
                ],
                global: false, // 缺省为 false
              },
              shadowColor: 'rgba(0, 178, 97, 1)', // 0% 处的颜色
              // shadowBlur: 0.5,
              type: 'solid',
              width: 0.1,
              shadowOffsetX: -0.4,
            },
          },
        },
        marker: {
          // symbol: 'circle',
          style: {
            // fill: items.style.stroke,
            // stroke: items.style.stroke,
            lineWidth: 0,
          },
        },
        customContent: (name: any, items: any) => {
          if (items.length === 0) return '';
          const container = document.createElement('div');
          container.className = 'g2-tooltip';
          const title = `<div class="g2-tooltip-title" style="margin-top: 12px;margin-bottom: 12px;">${name}</div>`;
          let listItem = '';
          items.forEach((item: any) => {
            listItem += `<li class="g2-tooltip-list-item" data-index={index} style="margin-bottom:4px;display:flex;align-items: center;">
                <span style="background-color:${
                  item?.mappingData?.color || item?.color
                };" class="g2-tooltip-marker"></span>
                <span style="display:inline-flex;flex:1;justify-content:space-between">
                <span style="margin-right: 16px;">${item?.name}:</span><span>${item?.value}</span>
                </span>
            </li>`;
          });
          container.innerHTML = title + listItem;
          return container;
        },
        customItems: (items: any) => {
          // 去掉没有值的点的tooltip
          const newItem = items.filter((list: any) => {
            return list.value;
          });
          // 下标
          const index = newItem.findIndex((item: any) => {
            return item.name === 'rate';
          });
          if (index !== -1) {
            newItem.splice(index, 1);
          }
          const listTitle = newItem.filter((item: any) => {
            return item.name === props.dialogTitle;
          });
          const indexTitle = newItem.findIndex((item: any) => {
            return item.name === props.dialogTitle;
          });
          if (indexTitle !== -1) {
            newItem.splice(indexTitle, 1);
          }
          if (listTitle.length !== 0) {
            newItem.unshift(listTitle[0]);
          }
          const currurList = newItem;
          return currurList;
        },
      });
      // 2023-12-06----初始打开颜色不正确， treeListCopy.value改为props.treeList.
      chart
        .interval()
        .adjust('stack')
        .position('date*value')
        .color('type', colorList.value.slice(0, props.treeList.length + 1));
      // 2023-12-06----初始打开颜色不正确， treeListCopy.value改为props.treeList.
      chart
        .line()
        .position('date*rate')
        .size(1)
        .color('type', colorList.value.slice(0, props.treeList.length + 1))
        .shape('smooth')
        .style({
          lineWidth: 1,
          shadowOffsetY: 8,
          shadowColor: 'rgba(75, 176, 255, 0.6)',
          shadowBlur: 10,
          zIndex: 99,
        });
      chart.point().position('date*rate').shape('breath-point');
      chart.interaction('legend-active', {
        start: [{ trigger: 'plot:mousemove', isEnable: false }],
        end: [{ trigger: 'plot:mouseleave', isEnable: false }],
      });
      chart.theme('newTheme');
      chart.render();
    };
    onMounted(() => {
      treeListCopy.value = cloneDeep(props.treeList);
      mapTreeList();
      nextTick(() => {
        g2Render();
      });
    });
    return {
      back,
      openDetail,
      treeListCopy,
    };
  },
});
