/*
 * @Description: 经营分析一般弹框右侧echarts显示
 * @Autor: kongx
 * @Date: 2022-05-30 9:10:11
 * @LastEditors: kongx
 * @LastEditTime: 2022-06-13 19:14:11
 */
import { defineComponent, onMounted, nextTick, watch } from 'vue';
import { Chart, registerTheme } from '@antv/g2';
import { cloneDeep } from 'lodash';
import { useStore } from 'vuex';
export default defineComponent({
  name: 'MHMGoodsCost',
  props: ['tableEchartsData', 'loadingStatus', 'tooltip'],
  setup(props, ctx) {
    const store = useStore();
    watch(
      () => props.tableEchartsData,
      (val) => {
        g2Render();
      },
      {
        deep: true,
      }
    );
    //图表初始渲染
    const g2Render = () => {
      const data = cloneDeep(props.tableEchartsData);
      if (typeof data === undefined || data.length === 0) return;
      registerTheme('newTheme', { maxColumnWidth: 10 });
      const chart = new Chart({
        container: 'container',
        autoFit: true,
      });
      chart.data(data);
      //设置x轴字体颜色和线条颜色
      chart.axis('date', {
        label: {
          offset: 8,
          style: {
            fill: 'rgba(0, 0, 0, 0.65)',
            lineHeight: 22,
            color: 'rgba(0, 0, 0, 0.65)',
            fontSize: 14,
          },
        },
        line: {
          style: {
            stroke: '#dadada',
          },
        },
      });
      chart.scale({
        value: {
          nice: true,
        },
      });
      //设置y轴字体颜色和线条颜色，设置y轴标题位置
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
          text: '元',
          autoRotate: false,
          offset: 10,
          position: 'end',
          style: {
            fill: 'rgba(0, 0, 0, 0.65)',
            fontSize: 14,
            color: 'rgba(0, 0, 0, 0.65)',
            textAlign: 'end',
            y: 15,
          },
        },
        line: {
          style: {
            stroke: '#dadada',
          },
        },
      });
      //设置图层直线和正方形框
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
            symbol: () => [['M', -4, 1], ['L', 6, 1], ['L', 6, 11], ['L', -4, 11], ['Z']],
            style: {
              fill: items.style.stroke,
              stroke: items.style.stroke,
              lineWidth: 1,
              radius: 1,
            },
          };
        },
        reversed: props.tableEchartsData[0].value < 0 ? true : false,
      });
      chart.tooltip({
        shared: true,
        showMarkers: true,
        showCrosshairs: false,
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
      });
      //禁用hover显示黑框边
      chart.interaction('legend-active', {
        start: [{ trigger: 'plot:mousemove', isEnable: false }],
        end: [{ trigger: 'plot:mouseleave', isEnable: false }],
      });
      //绘制柱状图
      chart.interval().adjust('stack').position('date*value').color('type', getColorList());
      //设置柱状图的最大宽度
      chart.theme('newTheme');
      chart.render();
    };
    //一般弹框的颜色
    const getColorList = () => {
      const color = ['#4BB0FF', '#D91026'];
      switch (store.state.dialogData.energyCode) {
        case '01000':
          color[0] = '#3681FF';
          break;
        case '02000':
          color[0] = '#FF9120';
          break;
        case '03000':
          color[0] = '#FFCB20';
          break;
        case '20000':
          color[0] = '#FE4B4E';
          break;
      }
      if (props.tableEchartsData[0].value < 0) {
        color.reverse();
      }
      return color;
    };
    onMounted(() => {
      nextTick(() => {
        g2Render();
      });
    });
  },
});
