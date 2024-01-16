import { defineComponent, computed } from 'vue';
export default defineComponent({
  name: 'PageCommon',
  props: {
    title: {
      // 页面标题
      type: String,
      default: ''
    },
    showSearch: {
      // 是否显示搜索模块
      type: Boolean,
      default: false
    },
    isSubHead: {
      // 是否有副标题
      type: Boolean,
      default: false
    },
    subTitle: {
      // 副标题
      type: String,
      default: ''
    },
    tagging: {
      // 副标题注释
      type: String,
      default: ''
    },
    showExport: {
      // 是否显示导出按钮
      type: Boolean,
      default: false
    },
    showDetail: {
      // 显示副标题注解 指标数据维护需要
      type: String,
      default: ''
    }
  },
  setup(props, { emit }) {
    /**
     * 导出点击事件
     */
    const reportExport = () => {
      emit('report-export');
    };
    const title = computed(() => {
      return props.title;
    });
    return {
      reportExport,
      title
    };
  }
});
