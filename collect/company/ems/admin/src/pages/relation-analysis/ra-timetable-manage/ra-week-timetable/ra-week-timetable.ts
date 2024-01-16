import { cloneDeep } from 'lodash';
import { defineComponent, ref, reactive, toRefs, PropType, watch, computed } from 'vue';
// utils
import { formatDate } from '@/utils/index';
import useCurrentInstance from '@/utils/use-current-instance';
import { onMorningDisable, onAfternoonDisable, onEveningDisable, calculateDate } from '../../utils/index';
// services
import weekWorkime from '../service/ra-timetable-manage.service';

interface TimeTableState {
  loading: boolean;
  reqLoading: boolean;
  storeDataSource: TimeTableModule.WeekTimeTableForm[];
}
export default defineComponent({
  props: {
    treeId: {
      type: Array as PropType<number[]>,
      default: [],
    },
    settingTreeList: {
      type: Array as PropType<number[]>,
      default: [],
    },
    isSettingFlag: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['onSaveSuccess'],
  setup(props, { emit }) {
    const { proxy } = useCurrentInstance();
    // 是否配置
    const isSettingFlag = computed(() => {
      return props.isSettingFlag;
    });
    // 选中的树节点列表
    const settingTreeList = computed(() => {
      return props.settingTreeList;
    });
    const timeTableState = reactive<TimeTableState>({
      loading: true,
      reqLoading: false,
      storeDataSource: [],
    });
    const dataSource = ref<Array<TimeTableModule.WeekTimeTableForm>>([]);
    // 获取当前列表
    const getWeekTimeList = async () => {
      try {
        timeTableState.loading = true;
        const res = await weekWorkime.getWeekTimeTableList(props.treeId[0]);
        if (res && res.code == 200 && res.success) {
          let list = cloneDeep(res.data);
          for (let i = 1; i < 8; i++) {
            const weeks = list.map((item) => {
              return item.week;
            });
            if (!weeks.includes(i)) {
              list.push({
                afternoonEnd: '00:00',
                afternoonStart: '12:59',
                id: i,
                morningEnd: '18:59',
                morningStart: '13:00',
                nightEnd: '23:59',
                nightStart: '19:00',
                week: i,
                treeId: props.treeId[0],
              });
            }
          }
          // 排序
          list = list.sort((a, b) => {
            return a.week - b.week;
          });
          // 处理特殊数据
          list = list.map((item) => {
            const newItem = cloneDeep(item);
            newItem.morningStart = newItem.morningStart === '--' ? '00:00' : newItem.morningStart;
            newItem.morningEnd = newItem.morningEnd === '--' ? '12:59' : newItem.morningEnd;
            newItem.afternoonStart = newItem.afternoonStart === '--' ? '13:00' : newItem.afternoonStart;
            newItem.afternoonEnd = newItem.afternoonEnd === '--' ? '18:59' : newItem.afternoonEnd;
            newItem.nightStart = newItem.nightStart === '--' ? '19:00' : newItem.nightStart;
            newItem.nightEnd = newItem.nightEnd === '--' ? '23:59' : newItem.nightEnd;
            return newItem;
          });
          calculateTableDataSource(list);
        } else {
          timeTableState.loading = false;
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error(res.message || '查询数据失败');
          }
        }
      } catch (err) {
        timeTableState.loading = false;
        proxy.$message.error('查询数据失败');
      } finally {
        timeTableState.loading = false;
      }
    };
    // 处理表格数据
    const calculateTableDataSource = (list: TimeTableModule.WeekTimeTableInfo[]) => {
      if (list.length) {
        dataSource.value = list.map((item: TimeTableModule.WeekTimeTableInfo) => {
          const { afternoonStart, afternoonEnd, morningEnd, morningStart, nightEnd, nightStart, week, treeId, id } =
            item;
          const isMorningReset = morningStart !== '' ? false : true;
          const morningDate = morningStart !== '' ? [calculateDate(morningStart), calculateDate(morningEnd)] : [];
          const isAfterReset = afternoonStart !== '' ? false : true;
          const afternoonDate =
            afternoonStart !== '' ? [calculateDate(afternoonStart), calculateDate(afternoonEnd)] : [];
          const isEveningReset = nightStart !== '' ? false : true;
          const eveningDate = nightStart !== '' ? [calculateDate(nightStart), calculateDate(nightEnd)] : [];
          return {
            week,
            treeId: Number(treeId),
            id,
            isMorningReset,
            morningDate,
            isAfterReset,
            afternoonDate,
            isEveningReset,
            eveningDate,
          };
        });
      } else {
        dataSource.value = [];
      }
      timeTableState.loading = false;
    };
    // 保存按钮事件
    const onWeekTimeTableSave = async () => {
      const paramList = dataSource.value.map((item) => {
        const { week, id, isMorningReset, morningDate, isAfterReset, afternoonDate, isEveningReset, eveningDate } =
          item;
        const morningStart = isMorningReset ? '' : formatDate(morningDate[0], 'HH:mm');
        const morningEnd = isMorningReset ? '' : formatDate(morningDate[1], 'HH:mm');
        const afternoonStart = isAfterReset ? '' : formatDate(afternoonDate[0], 'HH:mm');
        const afternoonEnd = isAfterReset ? '' : formatDate(afternoonDate[1], 'HH:mm');
        const nightStart = isEveningReset ? '' : formatDate(eveningDate[0], 'HH:mm');
        const nightEnd = isEveningReset ? '' : formatDate(eveningDate[1], 'HH:mm');
        return {
          week,
          treeIdList: props.settingTreeList,
          id,
          morningStart,
          morningEnd,
          afternoonStart,
          afternoonEnd,
          nightStart,
          nightEnd,
        };
      });
      try {
        const res = await weekWorkime.getWeekTimaTableUpdate(paramList);
        timeTableState.reqLoading = true;
        if (res.code == 200 && res.success) {
          proxy.$message.success(res.message || '保存成功');
          timeTableState.reqLoading = false;
          if (props.settingTreeList[0] === props.treeId[0]) {
            getWeekTimeList();
          }
          emit('onSaveSuccess');
        } else {
          if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
            proxy.$message.error(res.message || '保存失败');
          }
          timeTableState.reqLoading = false;
        }
      } catch (error) {
        timeTableState.reqLoading = false;
        proxy.$message.error('保存失败');
      }
    };
    // 修改早晨时间
    const onMorningChange = (row: TimeTableModule.WeekTimeTableForm) => {
      row.morningDate = [calculateDate('00:00'), calculateDate('12:59')];
    };
    // 修改中午时间
    const onAfterChange = (row: TimeTableModule.WeekTimeTableForm) => {
      row.afternoonDate = [calculateDate('13:00'), calculateDate('18:59')];
    };
    // 修改晚上时间
    const onEveningChange = (row: TimeTableModule.WeekTimeTableForm) => {
      row.eveningDate = [calculateDate('19:00'), calculateDate('23:59')];
    };
    // 取消配置
    const cancel = () => {
      dataSource.value = cloneDeep(timeTableState.storeDataSource);
    };
    /**
     * 监听树节点变化
     */
    watch(
      () => props.treeId,
      (newVal) => {
        if (newVal && newVal.length) {
          getWeekTimeList();
        } else {
          timeTableState.loading = false;
        }
      },
      { immediate: true },
    );
    /**
     * 监听是否编辑
     */
    watch(
      () => props.isSettingFlag,
      (newVal) => {
        if (newVal) {
          timeTableState.storeDataSource = cloneDeep(dataSource.value);
        }
      },
    );

    return {
      ...toRefs(timeTableState),
      dataSource,
      isSettingFlag,
      settingTreeList,
      onMorningChange,
      onAfterChange,
      onEveningChange,
      onWeekTimeTableSave,
      onMorningDisable,
      onAfternoonDisable,
      onEveningDisable,
      cancel,
    };
  },
});
