import { defineComponent, ref, PropType, watch } from 'vue';
import useCurrentInstance from '@/utils/use-current-instance';
import { cloneDeep } from 'lodash';

export default defineComponent({
  props: {
    chooseTimeList: {
      type: Array as PropType<Date[]>,
      default: [],
    },
  },
  setup(props, { emit }) {
    const { proxy } = useCurrentInstance();
    // popper开关
    const visible = ref(false);
    const yearList = ref<Array<{ key: boolean; value: number }>>([]);
    const tempYear = new Date().getFullYear();
    // 选择年份
    const chooseYear = ref<number[]>([]);
    for (let i = 0; i < 12; i++) {
      yearList.value.push({ value: tempYear - i, key: false });
    }
    yearList.value.reverse();
    /**
     * 日期选择
     */
    const clickYearItem = (index: number) => {
      if (chooseYear.value?.length === 10) {
        proxy.$message.error('日期最多可选10个！');
        return;
      }
      yearList.value[index].key = !yearList.value[index].key;
      if (yearList.value[index].key === true && chooseYear.value.indexOf(yearList.value[index].value) === -1) {
        chooseYear.value.push(yearList.value[index].value);
        // console.log(chooseYear.value);
      }
      if (yearList.value[index].key === false && chooseYear.value.indexOf(yearList.value[index].value) !== -1) {
        chooseYear.value.splice(chooseYear.value.indexOf(yearList.value[index].value), 1);
      }
      chooseYear.value.sort();
      // console.log(chooseYear.value);
      emit('getChooseDateValue', cloneDeep(chooseYear.value), 'year');
    };
    // 清空
    const onClear = () => {
      chooseYear.value = [];
      yearList.value = yearList.value.map((item) => {
        return {
          ...item,
          key: false,
        };
      });
      emit('getChooseDateValue', cloneDeep(chooseYear.value), 'year');
    };
    // 删除选择的年份
    const deleteYearItem = (item: number, index: number) => {
      chooseYear.value.splice(index, 1);
      for (let i = 0; i < yearList.value.length; i++) {
        if (yearList.value[i].value === item) {
          yearList.value[i].key = false;
        }
      }
      emit('getChooseDateValue', cloneDeep(chooseYear.value), 'year');
    };
    // 选择年份
    const changeYearPage = (flag: boolean) => {
      if (flag) {
        const upTempYear = yearList.value[0].value - 1;
        yearList.value = [];
        for (let i = 0; i < 12; i++) {
          yearList.value.push({ value: upTempYear - i, key: false });
        }
        yearList.value.reverse();
      } else {
        if (yearList.value[11].value >= tempYear) return;
        const upTempYear = yearList.value[11].value + 1;
        yearList.value = [];
        for (let i = 0; i < 12; i++) {
          yearList.value.push({ value: upTempYear + i, key: false });
        }
      }
      for (let i = 0; i < yearList.value.length; i++) {
        if (chooseYear.value.indexOf(yearList.value[i].value) !== -1) {
          yearList.value[i].key = true;
        }
      }
    };
    const onReset = () => {
      for (let i = 0; i < yearList.value.length; i++) {
        yearList.value[i].key = false;
      }
      chooseYear.value = [];
    };
    /**
     * 设置日期
     */
    const setYears = (value: number) => {
      chooseYear.value.push(value);
    };
    /**
     * 监听选中时间变化
     */
    watch(
      () => props.chooseTimeList,
      (newVal) => {
        chooseYear.value = [];
        if (newVal?.length) {
          newVal.forEach((item) => {
            const dateYear = new Date(item).getFullYear();
            chooseYear.value.push(dateYear);
            yearList.value.forEach((yearItem) => {
              if (dateYear === yearItem.value) {
                yearItem.key = true;
              }
            });
          });
        }
      },
      {
        immediate: true,
      },
    );
    return {
      yearList,
      visible,
      clickYearItem,
      chooseYear,
      deleteYearItem,
      changeYearPage,
      onReset,
      setYears,
      onClear,
    };
  },
});
