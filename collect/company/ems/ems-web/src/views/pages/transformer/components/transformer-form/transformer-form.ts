import { defineComponent, onMounted, reactive, ref, watch } from 'vue';
import { useCommonController } from '@/utils/use-common-controller';
import { debounce } from '@/utils/index';
import TransformerService from '../../services/transformer.services';
import { differenceInHours, differenceInDays } from 'date-fns';
import dateTimeUnitPicker from '@/views/pages/energy-analysis/components/ea-date-timeunit-linkage-picker/ea-date-timeunit-linkage-picker.vue';

export default defineComponent({
  name: 'transformerForm',
  components: {
    dateTimeUnitPicker,
  },
  emits: ['date-change'],
  setup(props, { emit }) {
    const { emitter, proxy } = useCommonController();
    /**
     * 表单数据
     */
    let initData = new Date();
    initData.setHours(0);
    initData.setMinutes(0);
    const formSearch = reactive<TransformerModule.FormData>({
      date: [],
      timeUnit: '',
      energyEfficiencySelected: [],
      energyEfficiencySelectedInfo: [],
    });
    /**
     * 时间颗粒度,时间选择器
     */
    const timeUnitData = ref([
      {
        name: '10分钟',
        code: '10m',
      },
      {
        name: '1小时',
        code: '1h',
      },
      {
        name: '天',
        code: '1d',
      },
      {
        name: '月',
        code: '1M',
      },
      {
        name: '年',
        code: '1y',
      },
    ]);
    /**
     * 能效节点相关数据，逻辑
     */
    const treeSelect = ref<any>(null);
    const defaultProps = {
      label: 'name',
      children: 'children',
    };
    const energyEfficiency = ref<TransformerModule.TreeNode[]>([]);
    const getTransformerTreeData = async () => {
      try {
        const res = await TransformerService.getTransformerTreeData();
        if (res && res.code === 200 && res.data.length > 0) {
          energyEfficiency.value = res.data;
          formSearch.energyEfficiencySelected = [energyEfficiency.value[0].id];
          formSearch.energyEfficiencySelectedInfo = [energyEfficiency.value[0]];
          emitter.emit('start-query', formSearch);
        } else {
          formSearch.energyEfficiencySelected = [];
          formSearch.energyEfficiencySelectedInfo = [];
          emitter.emit('start-query', formSearch);
        }
      } catch (error) {
        formSearch.energyEfficiencySelected = [];
        formSearch.energyEfficiencySelectedInfo = [];
        emitter.emit('start-query', formSearch);
      }
    };
    /**
     * 提交，重置
     */
    const onSubmit = () => {
      debounce(() => {
        if (formSearch.energyEfficiencySelected.length >= 1) {
          formSearch.energyEfficiencySelectedInfo = treeSelect.value.treeRef.getCheckedNodes();
        }
        if (formSearch.date === null) {
          proxy.$message.error('请先选择日期范围！');
        } else {
          const message = checkDateRange();
          if (message === '') {
            emitter.emit('start-query', formSearch);
          } else {
            proxy.$message.error(message);
          }
        }
      }, 300);
    };
    const onReset = () => {
      initData = new Date();
      initData.setHours(0);
      initData.setMinutes(0);
      formSearch.date = [initData, new Date()];
      formSearch.timeUnit = '10m';
      formSearch.energyEfficiencySelected = [energyEfficiency.value[0].id];
      formSearch.energyEfficiencySelectedInfo = [energyEfficiency.value[0]];
      emitter.emit('start-query', formSearch);
    };
    /**
     * 检查所选的日期范围
     */
    const checkDateRange = () => {
      let message = '';
      switch (formSearch.timeUnit) {
        case '10m':
          if (formSearch.date?.length === 2 && differenceInHours(formSearch.date[1], formSearch.date[0]) > 24) {
            message = '当前颗粒度下时间跨度不能超过24h!';
          }
          break;
        case '1h':
          if (formSearch.date?.length === 2 && differenceInDays(formSearch.date[1], formSearch.date[0]) > 31) {
            message = '当前颗粒度下时间跨度不能超过31天!';
          }
          break;
        case '1d':
          if (formSearch.date?.length === 2 && differenceInDays(formSearch.date[1], formSearch.date[0]) > 366) {
            message = '当前颗粒度下时间跨度不能超过366天!';
          }
          break;
      }
      return message;
    };
    /**
     * 监听时间选择器修改
     */
    watch(
      () => formSearch.date,
      (newV) => {
        emit('date-change', newV);
      },
    );
    onMounted(() => {
      formSearch.date = [initData, new Date()];
      formSearch.timeUnit = timeUnitData.value[0].code ?? '10m';
      getTransformerTreeData();
    });
    return {
      formSearch,
      timeUnitData,
      defaultProps,
      onSubmit,
      onReset,
      treeSelect,
      energyEfficiency,
    };
  },
});
