import {
    defineComponent,
    onMounted,
    ref,
    watch,
    computed,
    onUnmounted,
  } from 'vue';
  import { init, EChartsOption, EChartsType } from 'echarts';
  import * as echarts from 'echarts';
  import EchartsConfig from '@/config/echarts/index';
  import { useStore } from 'vuex';
  import { format, addMinutes } from 'date-fns';
  import { echartsConstant } from '@/config/echarts/constant';
  import * as lodash from 'lodash';
  import { throttle } from '@/utils/index';
  import { el } from 'date-fns/locale';
  export default defineComponent({
    props: ['subitemTargetChart'],
    setup(props) {
      const store = useStore();
      const wrap: string = 'charts_' + (Math.random() * 1000).toFixed(0);
      let line_chart: any;
      const icons = [
        'reat',
        EchartsConfig.echartsConstant.ECHARTS_SOLID_LEGEND_SVG,
        EchartsConfig.echartsConstant.ECHARTS_DASHED_THREE_LEGEND_ICON, //虚线
      ];
      const list = ['温度', '湿度', '二氧化碳', 'PM2.5', '一氧化碳'];
      const barData:any[] = [];
      // 主题
      const theme = ref(store.getters.theme ? store.getters.theme : 'light');
      // echarts颜色组
      const TENDENCY_ANALYSIS_CHART_LEGEND_TEXT_COLOR =
        echartsConstant.CHARTS_LINE_BAR_MAIN_COLOR;
      // 接收柱状图数据
      const subitemTargetChart = computed(() => {
        // 固定顺序排序
        for(let i=0;i<list.length;i++) {
          for(let j=0;j<props.subitemTargetChart.length; j++) {
            if(list[i] == props.subitemTargetChart[j].codeName) {
              barData.push(props.subitemTargetChart[j]);
            }
          }
        }
        return barData;
      });
      //获取x轴数据
      const xAxisData = () =>{
        const xAxisList:string[] = [];
        subitemTargetChart.value.forEach((item:any) => { 
            xAxisList.push(item.codeName)
        });
        return xAxisList;
      }
      const colorArr = ['rgba(54, 129, 255, 1)','rgba(255, 145, 32, 1)','rgba(255, 203, 32, 1)','rgba(0, 178, 97, 1)','rgba(254, 75, 78, 1)','rgba(68, 58, 255, 1)','rgba(168, 59, 255, 1)','rgba(0, 165, 178, 1)','rgba(217, 16, 38, 1)','rgba(236, 80, 210, 1)']
      // series 数据
      const seriesData = () => {
        const seriesList:any[] = [];
        // let yDataList:number[] = [];
        console.log('value',subitemTargetChart.value);
        subitemTargetChart.value.forEach((item:any,index:number) => { 
          const series:any = {
            name : item.codeName,
            type :'bar',
            stack:'energy',
            itemStyle:{
              color: (params:any) => {
                return colorArr[params.dataIndex];
              },
              borderRadius: [30, 30, 0, 0]
            },
            barWidth: 24
          };
          //data数据数组
          const dataArr:any[] = [];
          //全部把数据设置为‘-’
          subitemTargetChart.value.forEach((item:any,index:number) => {
                dataArr.push('-');
          });
          //替换数据
          dataArr[index] = item.codeScore;
          series.data = dataArr;
          seriesList.push(series);
        });
       
        // console.log("seriesList:",seriesList);
        
        return seriesList;
      }
  
     const drawLine = () => {
        const chartDom: HTMLElement | null = document.getElementById(wrap);
        if (!chartDom) {
          return;
        }
        line_chart = init(chartDom);
        const option: EChartsOption = {
          color: colorArr,
          tooltip: {
            trigger: 'axis',
            padding: [8, 12, 8, 12],
            backgroundColor: 'rgba(24,144,255,0.8)',
            confine: true,
            transitionDuration: 0.001,
            axisPointer: {
              type: 'line',
              snap: true,
              animation: false,
              lineStyle: {
                type:'solid',
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    {
                      offset: 1,
                      color: 'rgba(24, 144, 255, 0.01)' // 0% 处的颜色
                    },
                    {
                      offset: 0,
                      color: '#1890ff' // 100% 处的颜色
                    }
                  ],
                  global: false // 缺省为 false
                },
              },
            },
            extraCssText:
              'color:#fff;text-align:left;box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.15);border-radius:4px;z-index:99;',
            position: (
              //tootip提示位置
              pos,
              params,
              dom,
              rect: any,
              size: any
            ) => {
              const obj = [];
              if (size.viewSize[0] - (pos[0] + size.contentSize[0] + 30) > 0) {
                obj.push(pos[0] + 30);
              } else {
                obj.push(pos[0] - (size.contentSize[0] + 30));
              }
              obj.push('10%');
              return obj;
            },
            formatter(params: any) {
              let html = '';
              html += `<div class="tool-box" style="position:relative;">
                                          <div class="tool-title"></div>`;
              params.forEach((item: any) => {
                if(item.value != '-'){
                  html +=
                    `<div>${item.name}</div>
                    <div class="tool-item">
                    <div>评分 : ${
                      item.value || item.value === 0 ? item.value : '--'
                    }` +
                    `</div>
                    </div>
                    <div>`;
                }
               
              });
              return html;
            }
          },
          legend: {
                padding:[20, 0, 0, 0],
                show:true,
                itemHeight: 8,
                itemGap: 20,
                icon:'rect',
                textStyle: {
                  fontSize: 14,
                }
              },
          grid: {
                left: '4%',
                right: '4%',
                bottom: '3%',
                containLabel: true
              },
          xAxis: {
                type: 'category',
                data: xAxisData(),
                axisTick: {
                  show: false
                },
                axisLine: {
                //调整x轴坐标轴
                  lineStyle: {
                    color:
                      EchartsConfig.themeConstant[theme.value].CHARTS_AXIS_LINE_COLOR
                    }
                },
                axisLabel: {
                    //调整x轴坐标颜色
                    color:
                      EchartsConfig.themeConstant[theme.value].CHARTS_AXIS_TEXT_COLOR,
                    fontSize: 14,
                }
              },
          yAxis: {
                type: 'value',
                length: 2,
                // offset: 10,
                name: '分值',
                nameLocation: 'end', //坐标轴名称显示位置
                nameTextStyle: {
                  padding: [0,0,10,-10],
                  color:
                    EchartsConfig.themeConstant[theme.value].CHARTS_AXIS_TEXT_COLOR,
                  fontSize: 14
            },
            splitLine: {
              show: true,
              lineStyle: {
                type: 'dotted',
                color:
                  EchartsConfig.themeConstant[theme.value].CHARTS_SPLIT_LINE_COLOR
              }
            },
            axisLine: {
              show: true,
              lineStyle: {
                  // type: 'solid',
                color:EchartsConfig.themeConstant[theme.value].CHARTS_AXIS_LINE_COLOR
              }
            },
            axisLabel: {
              color:EchartsConfig.themeConstant[theme.value].CHARTS_AXIS_TEXT_COLOR,
              fontSize: 14,
            }
          },
          series:seriesData()
        };
        // 监听柱状图数据
        watch(
          () => subitemTargetChart.value,
          newVal => {
            if (newVal) {
              drawLine();
            }
          }
        );
        // 监听主题 重新渲染对应主题颜色 深拷贝解决同一个地址产生的数据过滤问题
        watch(
          () => store.getters.theme,
          (newVal: string) => {
            theme.value = newVal;
            // chartData_copy = cloneDeep(chartData);
            drawLine();
          }
        );
        line_chart && line_chart.setOption(option);
      };
    
      onMounted(() => {
        drawLine();
        // console.log('柱状图数据');
        // console.log(subitemTargetChart.value);
        window.addEventListener('resize', () => {
          throttle(line_chart.resize(), 150);
        });
      });
      onUnmounted(() => {
        window.removeEventListener('resize', () => {
          throttle(line_chart.resize(), 150);
        });     
      });
  
  
      return { subitemTargetChart, wrap}
     }
    })