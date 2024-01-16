import { defineComponent, reactive, ref, watch, PropType, computed, nextTick } from 'vue';
// utils
import { formatDate } from '@/utils/index';
// services
import dataEntryService from '@/pages/relation-analysis/ra-data-entry/service/ra-data-entry.service';
// components
import { ElForm } from 'element-plus';
import message from '@/utils/message';

export default defineComponent({
  name: 'DifferenceDateDialog',
  props: {
    // 详情
    dataDetail: {
      type: Object as PropType<DataEntryModule.DataEntryInfo>,
      default: {},
    },
    //编辑时当前行的数据 新增为null
    paramName: {
      type: String,
      default: '',
    },
    //表单时间颗粒数组
    timeUnitList: {
      type: Array as PropType<DataEntryModule.TimeDTOInfo[]>,
      default: [],
    },
    //父页面的id
    paramId: {
      type: Number,
      default: 0,
    },
    //时间颗粒默认选中值
    timeType: {
      type: String,
      default: '',
    },
    // 是否为新增
    isAddFlag: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['success'],
  setup(props, { emit }) {
    const dateFormRef = ref(ElForm);
    // 开关
    const dialogFormVisible = ref(false);
    // loading
    const reqLoading = ref(false);
    // paramName
    const paramName = computed(() => {
      return props.paramName;
    });
    let dataForm = reactive<DataEntryModule.DifferenceValueForm>({
      timeType: '',
      remark: '',
      collectTime: '',
      startValue: '',
      endValue: '',
      paramId: props.paramId,
    });
    // paramId
    const paramId = computed(() => {
      return props.paramId;
    });
    // 时间颗粒度
    const timeUnitList = computed(() => {
      return props.isAddFlag
        ? props.timeUnitList
        : props.timeUnitList.filter((item) => {
            return item.timeCode === props.timeType;
          });
    });
    // 表单校验
    const rules = {
      collectTime: [
        {
          type: 'date',
          required: true,
          message: '请选择时间',
          trigger: 'change',
        },
      ],
      startValue: [
        {
          type: 'date',
          required: true,
          message: '请选择日期',
          trigger: 'change',
        },
      ],
      endValue: [
        {
          type: 'date',
          required: true,
          message: '请选择日期',
          trigger: 'change',
        },
      ],
    };
    // 表单提交
    const onSubmit = async () => {
      //   验证表单规则
      dateFormRef.value.validate(async (valid: boolean) => {
        if (valid) {
          const { remark, startValue, endValue, collectTime } = dataForm;
          if (new Date(startValue).getTime() >= new Date(endValue).getTime()) {
            message.error('结束时间不能早于开始时间');
            return false;
          }
          const formCollTime = formatDate(collectTime, 'yyyy-MM-dd');
          const formStartValue = formatDate(startValue, 'yyyy-MM-dd HH:mm:ss');
          const formEndValue = formatDate(endValue, 'yyyy-MM-dd HH:mm:ss');
          // 判断编辑情况
          const params = {
            endValue: formEndValue,
            startValue: formStartValue,
            collectTime: formCollTime,
            remark,
            paramId: paramId.value,
          };
          const updateParams = {
            ...params,
            ...{
              dateId: props.dataDetail.id,
            },
          };
          try {
            reqLoading.value = true;
            const res = !props.isAddFlag
              ? await dataEntryService.getDifferenceDateUpdate(updateParams)
              : await dataEntryService.getDifferenceCreate(params);
            if (res.code == 200 && res.success) {
              emit('success');
              reqLoading.value = false;
              onBeforeClose();
              message.success(res.message);
            } else {
              reqLoading.value = false;
              if (!String((res as any)?.code)?.includes('4f0') && (res as any)?.code !== 401) {
                message.error(res.message || '操作失败');
              }
            }
          } catch (error) {
            reqLoading.value = false;
            message.error('操作失败');
          }
        }
      });
    };
    /**
     * 展开
     */
    const show = () => {
      dialogFormVisible.value = true;
      nextTick(() => {
        if (!props.isAddFlag) {
          const { collectTime, startValue, endValue, remark } = props.dataDetail;
          dataForm.collectTime = new Date(collectTime);
          dataForm.startValue = new Date(String(startValue));
          dataForm.endValue = new Date(String(endValue));
          dataForm.remark = remark;
        }
        dateFormRef.value.clearValidate();
      });
    };
    // 关闭前
    const onBeforeClose = () => {
      dialogFormVisible.value = false;
      dataForm.collectTime = '';
      dataForm.startValue = '';
      dataForm.endValue = '';
      dataForm.remark = '';
      dateFormRef.value.resetFields();
    };
    // 监听
    watch(
      () => props.timeType,
      () => {
        props.timeUnitList.forEach((item) => {
          if (item.timeCode === props.timeType) {
            dataForm.timeType = item.timeName;
          }
        });
      },
      {
        immediate: true,
      },
    );

    return {
      dialogFormVisible,
      rules,
      timeUnitList,
      dataForm,
      dateFormRef,
      paramName,
      onBeforeClose,
      onSubmit,
      show,
    };
  },
});
