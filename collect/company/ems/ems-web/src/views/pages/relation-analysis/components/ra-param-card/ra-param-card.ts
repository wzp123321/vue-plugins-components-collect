import { defineComponent, ref, computed, PropType } from 'vue';
// config
import analysisCardConstant from '../../constant/index';

export default defineComponent({
  name: 'AnalysisParamCard',
  props: {
    // 详情
    paramInfo: {
      type: Object as PropType<RelationAnalysisModule.RelationAnalysisParamVO>,
      default: {},
    },
    index: {
      type: Number,
      default: 0,
    },
    queryForm: {
      type: Object as PropType<RelationAnalysisModule.RelationAnalysisQueryParams>,
      default: {},
    },
    hasDataView: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['selectParam'],
  setup(props, context) {
    const type = ref('default');
    // 详情
    const paramInfo = computed(() => {
      return props.paramInfo;
    });
    // 是否需要展示查看数据
    const hasDataView = computed(() => {
      return props.hasDataView;
    });
    // 是否被选中
    const checked = computed(() => {
      const indexs = Array.isArray(props.queryForm.browserParamList)
        ? props.queryForm.browserParamList.map((item: { paramName: string; index?: number }) => {
            return item.index;
          })
        : [];
      return (!Array.isArray(props.queryForm.browserParamList) && props.index === 0) || indexs.includes(props.index);
    });
    // 样式配置
    const styleConstant = computed(() => {
      type.value = 'default';
      if (props.paramInfo.paramName.indexOf('风速') !== -1) {
        type.value = 'windSpeed';
      }
      if (props.paramInfo.paramName.indexOf('门诊量') !== -1) {
        type.value = 'clinicCount';
      }
      if (props.paramInfo.paramName.indexOf('作息时间') !== -1) {
        type.value = 'timeTable';
      }
      if (props.paramInfo.paramName.indexOf('照度') !== -1) {
        type.value = 'illuminance';
      }
      if (props.paramInfo.paramName.indexOf('湿度') !== -1) {
        type.value = 'humidity';
      }
      if (props.paramInfo.paramName.indexOf('人流量') !== -1) {
        type.value = 'pedestrianVolume';
      }
      if (props.paramInfo.paramName.indexOf('温度') !== -1) {
        type.value = 'temperature';
      }
      console.log(type.value);
      return analysisCardConstant[type.value];
    });
    // 计算标度数组
    const scaleList = computed(() => {
      const value = props.paramInfo.coefficient || 0;
      const list = [];
      let count = 50;
      for (let i = -1; i <= 1; i += 0.1) {
        const num = Number(i.toFixed(1));
        list.push({
          height: count,
          isFilled: (num < 0 && num >= value) || num === 0 || (num > 0 && num <= value),
        });
        count =
          num < -0 ? (count -= num === -1 || num === -0.9 ? 3 : 4) : (count += num === 0.8 || num === 0.9 ? 3 : 4);
      }
      return list;
    });
    // 计算实时值位置
    const relaTimeValueLeft = computed(() => {
      let value = props.paramInfo.coefficient || 0;
      value += 1;
      const index = Number((value / 0.1).toFixed(0));
      const count = 16 * index;
      return count > 296 ? 280 : count < 16 ? 16 : count;
    });
    // 点击参数
    const onParamSelect = () => {
      context.emit('selectParam', props.paramInfo);
    };
    // 重置文本
    const resetHtml = (text: string) => {
      return text
        .replace('影响较大', '<em style="color: var(--iot-color-active-red)">影响较大</em>')
        .replace('影响极大', '<em style="color: var(--iot-color-active-red)">影响极大</em>');
    };

    return {
      type,
      paramInfo,
      styleConstant,
      analysisCardConstant,
      scaleList,
      relaTimeValueLeft,
      checked,
      hasDataView,
      resetHtml,
      onParamSelect,
    };
  },
});
