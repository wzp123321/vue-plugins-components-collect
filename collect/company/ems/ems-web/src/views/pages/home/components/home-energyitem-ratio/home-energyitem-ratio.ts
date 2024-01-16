import { defineComponent, reactive, ref, toRefs } from 'vue';
import EnergyItemRatioChart from './components/her-chart/her-chart.vue';
export default defineComponent({
  name: 'EnergyItemRatio',
  components: {
    EnergyItemRatioChart,
  },
  props: {
    uid: {
      type: Number,
      default: null,
    },
  },
  setup() {
    const areaId = ref(null);
    const switchSelect = ref(1); // 能源类型选中
    const switchItems = [
      { value: 1, label: '电' },
      { value: 2, label: '水' },
    ]; // 能源类型数据源
    const chartState = reactive<EnergyItemRatioModule.DataList>({
      nodeName: '三甲医院',
      yAxisItems: [
        {
          title: '电占比',
          unit: 'kWh',
        },
      ],
      dataList: [
        {
          value: 1163331.86,
          name: '院区一区域',
          areaId: '256',
        },
        {
          value: 203544.24,
          name: '院区二区域',
          areaId: '263',
        },
        {
          value: 74799.21,
          name: '院区3区域',
          areaId: '276',
        },
        {
          value: 71025.07,
          name: '区域测试4',
          areaId: '270',
        },
        {
          value: 70041.14,
          name: '区域测试5',
          areaId: '271',
        },
        {
          value: 60593.22,
          name: '区域测试6',
          areaId: '272',
        },
        {
          value: 60377.45,
          name: '院区4区域',
          areaId: '277',
        },
        {
          value: 0,
          name: '新增二级节点1',
          areaId: '297',
        },
        {
          value: 0,
          name: '新增二级节点2',
          areaId: '298',
        },
        {
          value: 0,
          name: '你好年后@#',
          areaId: '299',
        },
        {
          value: 0,
          name: '来打架吧',
          areaId: '300',
        },
      ],
    });
    const chartClick = (item: any) => {
      const { data } = item;
      areaId.value = data.areaId;
      chartState.nodeName = '院区一区域';
      chartState.dataList = [
        {
          value: 389826.65,
          name: '其他建筑',
          areaId: '61',
        },
        {
          value: 278131.84,
          name: '科研教学',
          areaId: '23',
        },
        {
          value: 222137.13,
          name: '综合类',
          areaId: '16',
        },
        {
          value: 218186.85,
          name: '传染楼',
          areaId: '42',
        },
        {
          value: 206837.39,
          name: '体检楼',
          areaId: '53',
        },
        {
          value: 199910.9,
          name: '锅炉房',
          areaId: '28',
        },
        {
          value: 192018.77,
          name: '污水处理站',
          areaId: '32',
        },
        {
          value: 191181.26,
          name: '附属服务综合',
          areaId: '57',
        },
        {
          value: 189991.13,
          name: '动力楼',
          areaId: '38',
        },
        {
          value: 183868.37,
          name: '制剂楼',
          areaId: '49',
        },
        {
          value: 144381.39,
          name: '后勤办公',
          areaId: '20',
        },
        {
          value: 130034.89,
          name: '病房类',
          areaId: '13',
        },
        {
          value: 129968.27,
          name: '液氧站',
          areaId: '46',
        },
        {
          value: 121144.54,
          name: '门诊类',
          areaId: '2',
        },
        {
          value: 70005.22,
          name: '洗衣房',
          areaId: '36',
        },
      ];
    };
    const backClick = () => {
      areaId.value = null;
      chartState.nodeName = '三甲医院';
      chartState.dataList = [
        {
          value: 1163331.86,
          name: '院区一区域',
          areaId: '256',
        },
        {
          value: 203544.24,
          name: '院区二区域',
          areaId: '263',
        },
        {
          value: 74799.21,
          name: '院区3区域',
          areaId: '276',
        },
        {
          value: 71025.07,
          name: '区域测试4',
          areaId: '270',
        },
        {
          value: 70041.14,
          name: '区域测试5',
          areaId: '271',
        },
        {
          value: 60593.22,
          name: '区域测试6',
          areaId: '272',
        },
        {
          value: 60377.45,
          name: '院区4区域',
          areaId: '277',
        },
        {
          value: 0,
          name: '新增二级节点1',
          areaId: '297',
        },
        {
          value: 0,
          name: '新增二级节点2',
          areaId: '298',
        },
        {
          value: 0,
          name: '你好年后@#',
          areaId: '299',
        },
        {
          value: 0,
          name: '来打架吧',
          areaId: '300',
        },
      ];
    };
    return {
      ...toRefs(chartState),
      switchSelect,
      areaId,
      switchItems,
      chartClick,
      backClick,
    };
  },
});
