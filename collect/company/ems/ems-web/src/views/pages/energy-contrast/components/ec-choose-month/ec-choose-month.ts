import { defineComponent, ref, PropType, watch } from 'vue';
import { cloneDeep } from 'lodash';
import useCurrentInstance from '@/utils/use-current-instance';

export default defineComponent({
  props: {
    chooseTimeList: {
      type: Array as PropType<Date[]>,
      default: [],
    },
  },
  setup(props, { emit }) {
    const { proxy } = useCurrentInstance();
    // 开关
    const visible = ref(false);
    const year = ref(new Date().getFullYear());
    const tempYear = ref(new Date().getFullYear());
    /**
     * 月数组
     */
    const monthList = ref<Array<{ value: number; key: boolean; year: number }>>([
      { value: 1, key: false, year: tempYear.value },
      { value: 2, key: false, year: tempYear.value },
      { value: 3, key: false, year: tempYear.value },
      { value: 4, key: false, year: tempYear.value },
      { value: 5, key: false, year: tempYear.value },
      { value: 6, key: false, year: tempYear.value },
      { value: 7, key: false, year: tempYear.value },
      { value: 8, key: false, year: tempYear.value },
      { value: 9, key: false, year: tempYear.value },
      { value: 10, key: false, year: tempYear.value },
      { value: 11, key: false, year: tempYear.value },
      { value: 12, key: false, year: tempYear.value },
    ]);
    const yearList = ref<number[]>([]);
    for (let i = 0; i < 12; i++) {
      yearList.value.push(tempYear.value - i);
    }
    yearList.value.reverse();
    const monthListNum = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const chooseMonthListNum = ref<number[]>([]);
    const chooseMonthList = ref<any[]>([]);
    const showMonthBox = ref(true);
    /**
     * 月份选择
     */
    const OnMonthChoose = (index: number, month: number) => {
      if (checkDisabled(month)) {
        return;
      }
      if (chooseMonthList.value?.length === 10) {
        proxy.$message.error('日期最多可选10个！');
        return;
      }
      monthList.value[index].key = !monthList.value[index].key;
      if (monthList.value[index].key === true && chooseMonthList.value.indexOf(monthList.value[index].key) === -1) {
        chooseMonthList.value.push(cloneDeep(monthList.value[index]));
        chooseMonthListNum.value.push(monthList.value[index].value);
      }
      if (
        monthList.value[index].key === false &&
        chooseMonthListNum.value.indexOf(monthList.value[index].value) !== -1
      ) {
        chooseMonthList.value.splice(chooseMonthListNum.value.indexOf(monthList.value[index].value), 1);
        chooseMonthListNum.value.splice(chooseMonthListNum.value.indexOf(monthList.value[index].value), 1);
      }
      emit('getChooseDateValue', cloneDeep(chooseMonthList.value), 'month');
    };
    // 清空
    const onClear = () => {
      visible.value = false;
      chooseMonthList.value = [];
      monthList.value = monthList.value.map((item) => {
        return {
          ...item,
          key: false,
        };
      });
      emit('getChooseDateValue', cloneDeep(chooseMonthList.value), 'month');
    };
    // 删除
    const deleteYearItem = (index: number) => {
      if (chooseMonthList.value[index].year === monthList.value[0].year) {
        monthList.value[monthListNum.indexOf(chooseMonthList.value[index].value)].key = false;
      }
      chooseMonthList.value.splice(index, 1);
      emit('getChooseDateValue', cloneDeep(chooseMonthList.value), 'month');
    };
    /**
     * 年切换
     */
    const changeYear = (flag: boolean) => {
      if (flag) {
        year.value--;
      } else {
        if (year.value >= new Date().getFullYear()) return;
        year.value++;
      }
      monthList.value = [];
      for (let i = 0; i < 12; i++) {
        monthList.value.push({ value: i + 1, key: false, year: year.value });
      }
      for (let j = 0; j < chooseMonthList.value.length; j++) {
        if (chooseMonthList.value[j].year === monthList.value[0].year) {
          for (let k = 0; k < monthList.value.length; k++) {
            if (chooseMonthList.value[j].value === monthList.value[k].value) {
              monthList.value[k].key = true;
              break;
            }
          }
        }
      }
    };
    // 点击头部年份
    const onYearClick = () => {
      showMonthBox.value = false;
    };
    // 年份选择
    const onYearChoose = (index: number) => {
      showMonthBox.value = true;
      year.value = yearList.value[index];
      monthList.value = [];
      for (let i = 0; i < 12; i++) {
        monthList.value.push({ value: i + 1, key: false, year: year.value });
      }
      for (let j = 0; j < chooseMonthList.value.length; j++) {
        if (chooseMonthList.value[j].year === monthList.value[0].year) {
          for (let k = 0; k < monthList.value.length; k++) {
            if (chooseMonthList.value[j].value === monthList.value[k].value) {
              monthList.value[k].key = true;
              break;
            }
          }
        }
      }
    };
    /**
     * 校验禁用月份
     */
    const checkDisabled = (month: number) => {
      return new Date(`${year.value}-${month < 10 ? '0' + month : month}`).getTime() > new Date().getTime();
    };
    // 重置数据
    const onReset = () => {
      for (let i = 0; i < monthList.value.length; i++) {
        monthList.value[i].key = false;
      }
      chooseMonthList.value = [];
    };
    /**
     * 监听
     */
    watch(
      () => props.chooseTimeList,
      (newVal) => {
        chooseMonthList.value = [];
        chooseMonthListNum.value = [];
        if (newVal?.length) {
          newVal.forEach((item) => {
            const value = new Date(item).getMonth() + 1;
            const dateYear = new Date(item).getFullYear();
            chooseMonthList.value.push({
              key: true,
              value,
              year: dateYear,
            });
            chooseMonthListNum.value.push(value);
            monthList.value.forEach((monthItem) => {
              if (value === monthItem.value && monthItem.year === dateYear) {
                monthItem.key = true;
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
      monthList,
      year,
      visible,
      OnMonthChoose,
      chooseMonthList,
      tempYear,
      changeYear,
      deleteYearItem,
      showMonthBox,
      onYearClick,
      onYearChoose,
      yearList,
      chooseMonthListNum,
      onReset,
      checkDisabled,
      onClear,
    };
  },
});
