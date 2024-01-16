import { computed } from 'vue';
/*
 * @Description: 卡片
 * @Autor: zpwan
 * @Date: 2022-03-22 15:57:30
 * @LastEditors: zpwan
 * @LastEditTime: 2022-03-22 17:06:01
 */
import { defineComponent, PropType } from 'vue';

const tagColorObj = {
  月: '#faad14',
  自: '#722ed1',
  天: '#1890ff',
  季: '#196de9',
};

export default defineComponent({
  name: 'RgCard',
  props: {
    //   数据
    dataSource: {
      type: Object as PropType<reportGenerationHttp.getReportItemUrlType>,
      default: {},
    },
    // 选中的标识
    alias: {
      type: String,
      default: 'id',
    },
    // 选中的值
    selectedKey: {
      type: Number,
      default: 0,
    },
    // 类型
    type: {
      type: String,
      default: '',
    },
  },
  emits: ['selected'],
  setup(props, { emit }) {
    const dataSource = computed(() => {
      return props.dataSource;
    });
    const alias = computed(() => {
      return props.alias;
    });
    const selectedKey = computed(() => {
      return props.selectedKey;
    });
    const type = computed(() => {
      return props.type;
    });
    // 选中事件
    const onCardSelect = () => {
      if (props.dataSource) {
        emit(
          'selected',
          props.dataSource[props.alias] ? props.dataSource[props.alias] : '',
        );
      }
    };
    return {
      dataSource,
      alias,
      selectedKey,
      type,
      tagColorObj,
      onCardSelect,
    };
  },
});
