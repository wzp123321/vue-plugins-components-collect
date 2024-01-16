import { defineComponent, ref, watch, PropType } from 'vue';
import { subDays } from 'date-fns';
import { formatDate } from '@/utils/index';
import useCurrentInstance from '@/utils/use-current-instance';

export default defineComponent({
  props: {
    chooseTimeList: {
      type: Array as PropType<string[]>,
      default: [],
    },
  },
  setup(props, { emit }) {
    const { proxy } = useCurrentInstance();
    // 选中的时间数组
    const chooseDateList = ref<string[]>([]);
    // 当前时间
    const selectedDate = ref<any>(null);
    /**
     * 日期选择
     */
    const onDateAdd = () => {
      if (!selectedDate.value) {
        proxy.$message.error('请选择日期！');
        return;
      }
      if (chooseDateList.value?.length === 10) {
        proxy.$message.error('日期最多可选10个！');
        return;
      }
      if (chooseDateList.value?.length === 10) {
        proxy.$message.error('日期最多可选10个！');
        return;
      }
      if (
        chooseDateList.value.includes(
          formatDate(selectedDate.value, 'yyyy-MM-dd'),
        )
      ) {
        proxy.$message.error('当前日期已存在！');
        return;
      }
      chooseDateList.value.push(formatDate(selectedDate.value, 'yyyy-MM-dd'));
      emit('getChooseDateValue', chooseDateList.value, 'date');
    };
    // 删除
    const deleteWeekItem = (index: number) => {
      chooseDateList.value.splice(index, 1);
    };
    // 设置从缓存数据拿到的数据
    const setInitDateFromSession = () => {
      const date = new Date();
      date.setHours(0);
      date.setMinutes(0);
      date.setSeconds(0);
      chooseDateList.value.push(formatDate(subDays(date, 1), 'yyyy-MM-dd'));
      chooseDateList.value.push(formatDate(subDays(date, 8), 'yyyy-MM-dd'));
      selectedDate.value = subDays(date, 1);
    };
    // 重置
    const onReset = () => {
      chooseDateList.value = [];
      selectedDate.value = null;
    };
    // 清空
    const onClearWeek = () => {
      chooseDateList.value = [];
      selectedDate.value = null;
      emit('getChooseDateValue', chooseDateList.value, 'date');
    };
    /**
     * 日期禁用
     */
    const disabledDate = (time: Date) => {
      return new Date(time).getTime() > new Date().getTime();
    };
    // 格式化
    const formatSelectDate = (value: string) => {
      return formatDate(new Date(value), 'yyyy-MM-dd');
    };
    /**
     * 监听对比类型切换
     */
    watch(
      () => props.chooseTimeList,
      newVal => {
        chooseDateList.value = newVal?.length ? newVal : [];
        selectedDate.value = newVal?.length
          ? new Date(newVal[0]).getTime() > new Date(newVal[1]).getTime()
            ? new Date(newVal[0])
            : new Date(newVal[1])
          : null;
      },
      {
        immediate: true,
      },
    );

    return {
      selectedDate,
      chooseDateList,
      onDateAdd,
      deleteWeekItem,
      onReset,
      disabledDate,
      setInitDateFromSession,
      onClearWeek,
      formatSelectDate,
    };
  },
});
