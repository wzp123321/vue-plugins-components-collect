import { cloneDeep } from 'lodash';
import { defineComponent, ref, PropType, computed, nextTick } from 'vue';
// services
import timeTableService from '@/pages/relation-analysis/ra-timetable-manage/service/ra-timetable-manage.service';
// components
import { ElForm } from 'element-plus';
// utils
import { formatDate, disableCurrentDate } from '../../../../../utils/index';
import useCurrentInstance from '../../../../../utils/use-current-instance';
import { onMorningDisable, onAfternoonDisable, onEveningDisable, calculateDate } from '../../../utils/index';

import { FORM_CHECK_RULES } from '../../../../../config/index';

export default defineComponent({
  props: {
    specialDataDetail: {
      type: Object as PropType<TimeTableModule.SpecialTimeTableInfo>,
      default: {},
    },
    isAddFlag: {
      type: Boolean,
      default: true,
    },
    // 选中的树节点
    settingTreeList: {
      type: Array as PropType<number[]>,
      default: [],
    },
  },
  emits: ['saveSuccess'],
  setup(props, context) {
    const { proxy } = useCurrentInstance();
    const pageFormRef = ref(ElForm);
    const dialogFormVisible = ref<boolean>(false);
    const resetValue = {
      date: undefined,
      isEveningReset: false,
      isAfterReset: false,
      isMorningReset: false,
      morningDate: [new Date(2016, 9, 10, 0, 0), new Date(2016, 9, 10, 12, 59)],
      afternoonDate: [new Date(2016, 9, 10, 13, 0), new Date(2016, 9, 10, 18, 59)],
      eveningDate: [new Date(2016, 9, 10, 19, 0), new Date(2016, 9, 10, 23, 59)],
      remark: '',
    };
    // 初始值
    let initialValue: TimeTableModule.SpecialPageForm = {
      date: undefined,
      isEveningReset: false,
      isAfterReset: false,
      isMorningReset: false,
      morningDate: [new Date(2016, 9, 10, 0, 0), new Date(2016, 9, 10, 12, 59)],
      afternoonDate: [new Date(2016, 9, 10, 13, 0), new Date(2016, 9, 10, 18, 59)],
      eveningDate: [new Date(2016, 9, 10, 19, 0), new Date(2016, 9, 10, 23, 59)],
      remark: '',
    };
    const specialDataForm = ref<TimeTableModule.SpecialPageForm>({
      date: undefined,
      isEveningReset: false,
      isAfterReset: false,
      isMorningReset: false,
      morningDate: [new Date(2016, 9, 10, 0, 0), new Date(2016, 9, 10, 12, 59)],
      afternoonDate: [new Date(2016, 9, 10, 13, 0), new Date(2016, 9, 10, 18, 59)],
      eveningDate: [new Date(2016, 9, 10, 19, 0), new Date(2016, 9, 10, 23, 59)],
      remark: '',
    });
    const loading = ref(false);
    const specialDataDetail = computed(() => {
      return props.specialDataDetail;
    });
    const isAddFlag = computed(() => {
      return props.isAddFlag;
    });
    const rules = {
      date: [
        {
          type: 'date',
          required: true,
          message: '请选择时间',
          trigger: 'change',
        },
      ],
      morningDate: [
        {
          trigger: 'change',
          validator: (rule: any, value: string[]) => {
            if (value && value.length === 2 && new Date(value[0]).getTime() === new Date(value[1]).getTime()) {
              return false;
            } else {
              return true;
            }
          },
          message: '开始时间不能晚于结束时间',
        },
      ],
      afternoonDate: [
        {
          trigger: 'change',
          validator: (rule: any, value: string[]) => {
            if (value && value.length === 2 && new Date(value[0]).getTime() === new Date(value[1]).getTime()) {
              return false;
            } else {
              return true;
            }
          },
          message: '开始时间不能晚于结束时间',
        },
      ],
      eveningDate: [
        {
          trigger: 'change',
          validator: (rule: any, value: string[]) => {
            if (value && value.length === 2 && new Date(value[0]).getTime() === new Date(value[1]).getTime()) {
              return false;
            } else {
              return true;
            }
          },
          message: '开始时间不能晚于结束时间',
        },
      ],
    };
    // 日期切换
    const onDateRangChange = (date: Date, type: string) => {
      if (type === 'morning' && !date) {
        specialDataForm.value.morningDate = [calculateDate('00:00'), calculateDate('12:59')];
      }
      if (type === 'afternoon' && !date) {
        specialDataForm.value.afternoonDate = [calculateDate('13:00'), calculateDate('18:59')];
      }
      if (type === 'evening' && !date) {
        specialDataForm.value.eveningDate = [calculateDate('19:00'), calculateDate('23:59')];
      }
    };
    // 禁止选择时间 end
    // 确认按钮
    const onSave = () => {
      pageFormRef.value.validate(async (valid: boolean) => {
        if (valid) {
          const { settingTreeList } = props;
          const {
            date,
            isEveningReset,
            isMorningReset,
            isAfterReset,
            morningDate,
            afternoonDate,
            eveningDate,
            remark,
          } = specialDataForm.value;
          let params: any = {
            afternoonEnd: isAfterReset ? '' : formatDate(afternoonDate[1], 'HH:mm'),
            afternoonStart: isAfterReset ? '' : formatDate(afternoonDate[0], 'HH:mm'),
            morningEnd: isMorningReset ? '' : formatDate(morningDate[1], 'HH:mm'),
            morningStart: isMorningReset ? '' : formatDate(morningDate[0], 'HH:mm'),
            nightEnd: isEveningReset ? '' : formatDate(eveningDate[1], 'HH:mm'),
            nightStart: isEveningReset ? '' : formatDate(eveningDate[0], 'HH:mm'),
            remark,
          };
          if (isAddFlag.value) {
            params = {
              ...params,
              treeIdList: settingTreeList,
              date: formatDate(date, 'yyyy-MM-dd'),
            };
          }
          // 编辑
          const { id } = props.specialDataDetail;
          const updateParams = {
            ...params,
            id,
          };
          loading.value = true;
          try {
            const res = !props.isAddFlag
              ? await timeTableService.getSpecialTimeTableUpdate(updateParams)
              : await timeTableService.getSpecialTimeTableAdd(params);
            if (res && res.code == 200 && res.success) {
              dialogFormVisible.value = false;
              loading.value = false;
              proxy.$message.success(res.message);
              onBeforeClose();
              context.emit('saveSuccess');
            } else {
              loading.value = false;
              if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
                proxy.$message.error(res.message || '操作失败');
              }
            }
          } catch (error) {
            loading.value = false;
            proxy.$message.error('操作失败');
          }
        }
      });
    };
    //打开
    const show = (value: TimeTableModule.SpecialTimeTableInfo, flag: boolean) => {
      dialogFormVisible.value = true;
      if (!flag) {
        const { afternoonEnd, afternoonStart, morningEnd, morningStart, nightEnd, nightStart, remark, date } = value;
        if (afternoonStart) {
          specialDataForm.value.isAfterReset = false;
          specialDataForm.value.afternoonDate = [
            calculateDate(String(afternoonStart)),
            calculateDate(String(afternoonEnd)),
          ];
        } else {
          specialDataForm.value.isAfterReset = true;
        }
        if (morningStart) {
          specialDataForm.value.isMorningReset = false;
          specialDataForm.value.morningDate = [calculateDate(String(morningStart)), calculateDate(String(morningEnd))];
        } else {
          specialDataForm.value.isMorningReset = true;
        }
        if (nightStart) {
          specialDataForm.value.isEveningReset = false;
          specialDataForm.value.eveningDate = [calculateDate(String(nightStart)), calculateDate(String(nightEnd))];
        } else {
          specialDataForm.value.isEveningReset = true;
        }
        specialDataForm.value.remark = remark;
        specialDataForm.value.date = new Date(date);
      } else {
        specialDataForm.value = cloneDeep(initialValue);
        nextTick(() => {
          pageFormRef.value.clearValidate();
        });
      }
    };
    // 关闭前
    const onBeforeClose = () => {
      nextTick(() => {
        pageFormRef.value.resetFields();
      });
      initialValue = cloneDeep(resetValue);
      specialDataForm.value = cloneDeep(resetValue);
      dialogFormVisible.value = false;
    };

    return {
      pageFormRef,
      specialDataForm,
      specialDataDetail,
      dialogFormVisible,
      rules,
      FORM_CHECK_RULES,
      loading,
      isAddFlag,
      onMorningDisable,
      onAfternoonDisable,
      onEveningDisable,
      onSave,
      show,
      onBeforeClose,
      disableCurrentDate,
      onDateRangChange,
    };
  },
});
