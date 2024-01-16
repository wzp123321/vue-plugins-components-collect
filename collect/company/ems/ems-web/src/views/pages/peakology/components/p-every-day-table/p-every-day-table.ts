import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'vuex';
import { thousandSeparation } from '@/utils/index';
export default defineComponent({
  props: ['everyDayTableData'],
  setup(props) {
    const store = useStore();
    const unit = ref<string>('kW/m<sup style="font-size:12px;">2</sup>');
    const tableData = computed(() => {
      return props.everyDayTableData;
    });
    const lightOrDark = computed(() => {
      return store.getters.theme == 'light' ? true : false;
    });
    // 格式化
    const formatFact = (row: object, column: object, cellValue: any) => {
      return thousandSeparation(cellValue);
    };

    return {
      tableData,
      lightOrDark,
      unit,
      formatFact,
    };
  },
});
