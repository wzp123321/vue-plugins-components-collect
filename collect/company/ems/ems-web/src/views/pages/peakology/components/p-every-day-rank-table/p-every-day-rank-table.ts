import { defineComponent, computed } from 'vue';
import { useStore } from 'vuex';
import { thousandSeparation } from '@/utils/index';
interface columnType {
  date: string;
  value: number;
}
export default defineComponent({
  props: ['everyDayRankTableData'],
  setup(props) {
    const store = useStore();
    const lightOrDark = computed(() => {
      return store.getters.theme == 'light' ? true : false;
    });
    const tableDatas = computed(() => {
      return props.everyDayRankTableData;
    });
    // 格式化
    const formatFact = (
      row: columnType,
      column: columnType,
      cellValue: number,
    ) => {
      return thousandSeparation(cellValue);
    };

    return {
      lightOrDark,
      formatFact,
      tableDatas,
    };
  },
});
